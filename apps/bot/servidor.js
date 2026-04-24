import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

async function verificarLimite(salonId, salon) {
  if (!salonId) return { permitido: true }
  const limites = { 'free': 15, 'basico': 50, 'premium': 999999 }
  const limite = limites[salon?.plan] || 15
  if ((salon?.citas_mes || 0) >= limite) {
    return {
      permitido: false,
      mensaje: `Tu salón llegó al límite de *${limite} citas* del plan *${salon?.plan || 'free'}*.\n\nPara subir de plan escribe a AgendaYa:\nwa.me/51913276046`
    }
  }
  return { permitido: true }
}

async function obtenerConfigSalon(salonId) {
  const { data } = await supabase
    .from('config_salon')
    .select('*')
    .eq('salon_id', salonId)
    .maybeSingle()
  return data
}

async function obtenerServiciosSalon(salonId) {
  const { data } = await supabase
    .from('servicios_salon')
    .select('*')
    .eq('salon_id', salonId)
    .eq('activo', true)
    .order('created_at', { ascending: true })
  return data || []
}

function construirMenuServicios(servicios) {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']
  return servicios.map((s, i) => `${emojis[i] || `${i+1}.`} ${s.nombre} - S/${s.precio}`).join('\n')
}

export async function procesarMensaje(telefono, mensaje, phoneNumberId) {
  const texto = mensaje.toLowerCase().trim()

  console.log('📱 Telefono:', telefono)
  console.log('💬 Texto:', texto)

  // Buscar salón
  const { data: salon } = await supabase
    .from('salones')
    .select('*')
    .eq('telefono_bot', phoneNumberId)
    .maybeSingle()

  const salonId = salon?.id || null
  const salonNombre = salon?.nombre || 'Salón AgendaYa'

  // Cargar config y servicios del salón
  const config = salonId ? await obtenerConfigSalon(salonId) : null
  const servicios = salonId ? await obtenerServiciosSalon(salonId) : []

  // Nombre del asistente
  const nombreAsistente = config?.nombre_asistente || 'tu asistente'

  // Mensaje de bienvenida personalizado o por defecto
  const menuServicios = servicios.length > 0
    ? construirMenuServicios(servicios)
    : '1️⃣ Corte - S/30\n2️⃣ Tinte - S/80\n3️⃣ Peinado - S/40\n4️⃣ Manicure - S/25'

  const mensajeBienvenida = config?.mensaje_bienvenida
    ? config.mensaje_bienvenida
    : `¡Hola! 😊 Bienvenida a *${salonNombre}*. Soy ${nombreAsistente}, tu asistente virtual.`

  const MENU = `${mensajeBienvenida}\n\n*Nuestros servicios:*\n${menuServicios}\n\nEscribe *agendar* para reservar tu cita 💅`

  // Cargar conversación
  const { data: conv } = await supabase
    .from('conversaciones')
    .select('*')
    .eq('telefono', telefono)
    .maybeSingle()

  const paso = conv?.paso || 'inicio'
  console.log('📍 Paso actual:', paso)

  if (texto === 'hola' || texto === 'hi' || texto === 'buenas' || paso === 'inicio') {
    await supabase.from('conversaciones').upsert(
      { telefono, paso: 'inicio' },
      { onConflict: 'telefono' }
    )
    return MENU
  }

  if (texto === 'agendar') {
    const limite = await verificarLimite(salonId, salon)
    if (!limite.permitido) return limite.mensaje

    await supabase.from('conversaciones').upsert(
      { telefono, paso: 'eligiendo_servicio' },
      { onConflict: 'telefono' }
    )
    return `¿Qué servicio quieres? 💅\n\n${menuServicios}\n\nEscribe el número de tu elección`
  }

  if (paso === 'eligiendo_servicio') {
    const indice = parseInt(texto) - 1
    if (isNaN(indice) || indice < 0 || indice >= servicios.length) {
      return `Por favor escribe el número de tu servicio (1 al ${servicios.length})`
    }

    const servicioElegido = servicios[indice]

    await supabase.from('conversaciones').upsert(
      { telefono, paso: 'eligiendo_fecha', servicio_id: servicioElegido.id },
      { onConflict: 'telefono' }
    )
    return `Elegiste *${servicioElegido.nombre}* - S/${servicioElegido.precio} ✅\n\n¿Qué día quieres tu cita?\nEscribe la fecha así: *2026-04-25*`
  }

  if (paso === 'eligiendo_fecha') {
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!fechaRegex.test(texto)) return 'Escribe la fecha así: *2026-04-25*'

    const fecha = new Date(texto)
    if (isNaN(fecha.getTime())) return 'Fecha inválida. Escribe así: *2026-04-25*'

    await supabase.from('conversaciones').upsert(
      { telefono, paso: 'eligiendo_hora', fecha: texto },
      { onConflict: 'telefono' }
    )
    return `Fecha: *${texto}* ✅\n\n¿A qué hora quieres tu cita?\nEscribe la hora así: *10:00*`
  }

  if (paso === 'eligiendo_hora') {
    const horaRegex = /^\d{2}:\d{2}$/
    if (!horaRegex.test(texto)) return 'Escribe la hora así: *10:00*'

    const [h, m] = texto.split(':').map(Number)
    if (h < 6 || h > 21 || m > 59) return 'Hora inválida. Escribe una hora entre 06:00 y 21:00'

    const { error: citaError } = await supabase.from('citas').insert({
      cliente_telefono: telefono,
      servicio_id: conv.servicio_id,
      fecha: conv.fecha,
      hora: texto,
      estado: 'pendiente',
      salon_id: salonId
    })

    if (citaError) return 'Error al guardar la cita. Escribe *agendar* para intentar de nuevo.'

    if (salonId) {
      await supabase.from('salones')
        .update({ citas_mes: (salon?.citas_mes || 0) + 1 })
        .eq('id', salonId)
    }

    await supabase.from('conversaciones').delete().eq('telefono', telefono)

    const direccion = config?.direccion ? `\n📍 ${config.direccion}` : ''
    return `✅ *¡Cita confirmada!*\n\nServicio: ${servicios.find(s => s.id === conv.servicio_id)?.nombre || 'tu servicio'}\n📅 Fecha: ${conv.fecha}\n⏰ Hora: ${texto}${direccion}\n\n¡Te esperamos en *${salonNombre}*! 💕`
  }

  return MENU
}