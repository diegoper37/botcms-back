import { Router } from 'express'
import { WebhookController } from './WebhookEventHandler'
import { FacebookMessageParser, ValidateWebhook } from 'fb-messenger-bot-api'

const debug = require('debug')('botcms:webhook-facebook')
const WebhookRouter = Router()

WebhookRouter.get('/', (req, res) => ValidateWebhook.validateServer(req, res))

WebhookRouter.post('/', async (req, res) => {
  const { body } = req

  const messages = FacebookMessageParser.parsePayload(body)
  debug(messages)

  if (messages && messages.length) {
    const webhookController = new WebhookController(messages[0])
    webhookController.process()

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED')
  } else {
    res.sendStatus(404)
  }
})

export default WebhookRouter
