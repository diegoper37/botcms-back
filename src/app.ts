import * as express from 'express'
import * as mongoose from 'mongoose'
import * as errorHandler from 'errorhandler'

// Router
import IndexRouter from './routes'

// Webhook
import WebhookRouter from './webhooks'

class App {
  app: express.Application
  debug = require('debug')('bot-cms-server:app')

  constructor() {
    this.app = express()
    this.database()
    this.config()
  }

  private database() {
    const { DB_URI, DB_NAME, DB_USER, DB_PASS } = process.env
    mongoose.connect(`${DB_URI}`, {
      user: DB_USER,
      pass: DB_PASS,
      dbName: DB_NAME,
      useNewUrlParser: true,
      useCreateIndex: true,
    })
  }

  private config() {
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    })
    this.app.set('port', process.env.PORT || 3000)
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: false }))

    this.app.use('/webhook', WebhookRouter)
    this.app.use('/api/v1', IndexRouter)

    // catch 404 and forward to error handler
    this.app.use(
      (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        err.status = 404
        next(err)
      },
    )

    // error handling
    this.app.use(errorHandler())
  }
}

export default new App().app
