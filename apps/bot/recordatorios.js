import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_ID = process.env.WHATSAPP_PHONE_ID

async function enviarMensaje(telefono, mensaje) {
  await fetch(`https://graph.facebook.com/v25.0/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'text',
      text: { body: mensaje }
    })
  })
}

export async function enviarRecordatorios() {
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaManana = manana.toISOString().split('T')[0]

  console.log('📅 Buscando citas para:', fechaManana)

  const { data: citas } = await supabase
    .from('citas')
    .select('*, servicios_salon(nombre), salones(nombre)')
    .eq('fecha', fechaManana)
    .eq('estado', 'pendiente')

  if (!citas || citas.length === 0) {
    console.log('Sin citas para mañana')
    return
  }

  console.log(`📨 Enviando ${citas.length} recordatorios`)

  for (const cita of citas) {
    const mensaje = `Hola! 💅 Te recordamos que mañana tienes una cita en *${cita.salones?.nombre || 'tu salón'}*.\n\n📅 Fecha: ${cita.fecha}\n⏰ Hora: ${cita.hora?.slice(0,5)}\n✂️ Servicio: ${cita.servicios_salon?.nombre}\n\nEscribe *confirmar* para confirmar o *cancelar* para cancelar.`
    await enviarMensaje(cita.cliente_telefono, mensaje)
    console.log('✅ Recordatorio enviado a:', cita.cliente_telefono)
  }
}