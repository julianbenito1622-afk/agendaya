import 'dotenv/config'
import crypto from 'crypto'
import express from 'express'
import { procesarMensaje } from './servidor.js'
import { enviarRecordatorios } from './recordatorios.js'

const app = express()

// Captura el body raw antes de parsearlo — necesario para verificar X-Hub-Signature-256
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
  console.error('Faltan variables de entorno requeridas. Revisa tu archivo .env')
  process.exit(1)
}

// Middleware: verifica X-Hub-Signature-256 en cada POST del webhook
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
    console.warn('Solicitud rechazada: firma inválida')
    return res.sendStatus(403)
  }

  next()
}

// GET — verificación inicial del webhook con Meta
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  } else {
    res.sendStatus(403)
  }
})

// POST — recibe mensajes de WhatsApp (protegido con firma HMAC)
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

  console.log('Mensaje recibido de:', telefono, '→', texto)

  const phoneNumberId = change?.value?.metadata?.phone_number_id
  const respuesta = await procesarMensaje(telefono, texto, phoneNumberId)

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
      text: { body: respuesta }
    })
  })

  res.sendStatus(200)
})

app.listen(3001, () => console.log('Bot corriendo en puerto 3001'))

// Cron job: corre cada día a las 8am
setInterval(async () => {
  const ahora = new Date()
  if (ahora.getHours() === 8 && ahora.getMinutes() === 0) {
    console.log('Ejecutando recordatorios...')
    await enviarRecordatorios()
  }
}, 60000)
