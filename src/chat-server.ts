import * as express from 'express'
import * as socketIo from 'socket.io'
import app from './app'
import { Server } from 'http'

// Service
import NlpService from './services/nlp.service'
import ElasticService from './services/elasticsearch.service'
import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch'
const debug = require('debug')('botcms:webchat')

export class ChatServer {
  readonly PORT = process.env.PORT || 3000
  private app: express.Application
  private server: Server
  private io: socketIo.Server = ''

  constructor() {
    this.createApp()
    this.createServer()
    this.sockets()
    this.listen()
  }

  private createApp(): void {
    this.app = app
  }

  private createServer(): void {
    this.server = require('http').Server(this.app)
  }

  private sockets(): void {
    this.io = socketIo(this.server)
  }

  private listen(): void {
    this.server.listen(this.PORT, () => {
      console.log('Running server on port %s', this.PORT)
    })

    this.io.on('connection', socket => {
      socket.emit('MESSAGE', { message: 'Hey' })
      socket.emit('MESSAGE', {
        message:
          'Você pode me fazer perguntas sobre assuntos relacionados a educação, política constitucional, ética e cidadania.',
      })
      socket.emit('MESSAGE', { message: 'Vamos lá, me faça uma pergunta...' })
      socket.emit('MESSAGE', { message: { type: 'emoji', emoji: '😎' } })
      socket.on('SEND_MESSAGE', async data => {
        debug(data)
        const response = await NlpService.process('pt', data.message.data.text)
        response.date = new Date()
        response.origin = 'webchat'
        response.ip_addr = socket.handshake.address
        response.environment = process.env.NODE_ENV
        const dataElastic: RequestParams.Index = {
          index: 'botcms',
          body: response,
        }
        debug(response)
        ElasticService.index(dataElastic)
        if (response.answer) {
          socket.emit('MESSAGE', { message: response.answer })
        } else {
          socket.emit('MESSAGE', { message: { type: 'emoji', emoji: '😕' } })
          socket.emit('MESSAGE', {
            message: 'Não entendi sua pergunta... sou um robô novo e ainda estou sendo treinado.',
          })
          socket.emit('MESSAGE', { message: 'Vamos lá, me faça uma pergunta...' })
        }
      })
    })
  }

  getApp(): express.Application {
    return this.app
  }
}
