import 'dotenv/config'
import crypto from 'crypto'
import express from 'express'
import { procesarMensaje } from './servidor.js'
import { enviarRecordatorios } from './recordatorios.js'

const app = express()

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf
  }
}))

const VERIFY_TOKEN   = process.env.WHATSAPP_VERIFY_TOKEN
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_ID       = process.env.WHATSAPP_PHONE_ID
const APP_SECRET     = process.env.WHATSAPP_APP_SECRET

if (!VERIFY_TOKEN || !WHATSAPP_TOKEN || !PHONE_ID || !APP_SECRET) {
  console.error('Variables faltantes:', {
    VERIFY_TOKEN: !!VERIFY_TOKEN,
    WHATSAPP_TOKEN: !!WHATSAPP_TOKEN,
    PHONE_ID: !!PHONE_ID,
    APP_SECRET: !!APP_SECRET
  })
  process.exit(1)
}

function verificarFirmaMeta(req, res, next) {
  const signature = req.headers['x-hub-signature-256']
  if (!signature) {
    console.warn('Solicitud rechazada: falta X-Hub-Signature-256')
    return res.sendStatus(401)
  }
  const expected = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(req.rawBody)
    .digest('hex')
  const sigBuffer      = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    console.warn('Solicitud rechazada: firma invalida')
    return res.sendStatus(403)
  }
  next()
}

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  } else {
    res.sendStatus(403)
  }
})

app.post('/webhook', verificarFirmaMeta, async (req, res) => {
  const body = req.body
  if (body.object !== 'whatsapp_business_account') return res.sendStatus(404)

  const entry   = body.entry?.[0]
  const change  = entry?.changes?.[0]
  const message = change?.value?.messages?.[0]
  if (!message) return res.sendStatus(200)

  const telefono = message.from
  const texto    = message.text?.body
  if (!texto) return res.sendStatus(200)

  console.log('Mensaje recibido de:', telefono, '->', texto)

  const phoneNumberId = change?.value?.metadata?.phone_number_id
  console.log('Phone Number ID recibido:', phoneNumberId)

  const respuesta = await procesarMensaje(telefono, texto, phoneNumberId)
  console.log('Respuesta generada:', respuesta?.substring(0, 100))

  try {
    const metaResponse = await fetch(`https://graph.facebook.com/v25.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: telefono,
        type: 'text',
        text: { body: respuesta }
      })
    })

    const metaData = await metaResponse.json()
    if (metaResponse.ok) {
      console.log('Mensaje enviado OK a:', telefono)
    } else {
      console.error('Error de Meta al enviar:', JSON.stringify(metaData))
    }
  } catch (error) {
    console.error('Error al hacer fetch a Meta:', error.message)
  }

  res.sendStatus(200)
})

app.listen(3001, () => console.log('Bot corriendo en puerto 3001'))

setInterval(async () => {
  const ahora = new Date()
  if (ahora.getHours() === 8 && ahora.getMinutes() === 0) {
    console.log('Ejecutando recordatorios...')
    await enviarRecordatorios()
  }
}, 60000)