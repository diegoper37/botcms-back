import {
  FacebookMessagingAPIClient,
  FacebookMessagePayloadMessagingEntry,
} from 'fb-messenger-bot-api'
import NlpService from '../services/nlp.service'
import ElasticService from '../services/elasticsearch.service'
import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch'
const debug = require('debug')('botcms:webhook-facebook')

export class WebhookController {
  private messageEntry: FacebookMessagePayloadMessagingEntry
  private messagingClient: FacebookMessagingAPIClient

  constructor(messageEntry: FacebookMessagePayloadMessagingEntry) {
    this.messageEntry = messageEntry
    this.messagingClient = new FacebookMessagingAPIClient(process.env.FB_PAGE_ACCESS_TOKEN)
  }

  async process() {
    const { message, postback, sender } = this.messageEntry

    this.messagingClient.markSeen(sender.id)

    if (message) {
      this.processMessage()
    }
  }

  private async processMessage() {
    const { sender, message } = this.messageEntry

    if (message.text) {
      if (message.quick_reply) {
        this.messagingClient.sendTextMessage(sender.id, message.quick_reply.payload)
      } else {
        this.messagingClient.toggleTyping(sender.id, true)
        debug(sender)
        debug(message)
        const response = await NlpService.process('pt', message.text)
        response.date = new Date();
        response.origin = 'messenger'
        response.environment = process.env.NODE_ENV
        const dataElastic: RequestParams.Index = {
          index: 'botcms',
          body: response,
        }
        debug(response)
        ElasticService.index(dataElastic)
        if (response.answer){
          this.messagingClient.sendTextMessage(sender.id, response.answer)
        } else {
          this.messagingClient.sendTextMessage(
            sender.id,
            'Desculpe, sou um bot novo e ainda preciso de treinamento, não entendi sua pergunta, poderia formular de outra maneira?',
          )
        }
      }

      //this.sendResponse()
    }
  }
}
