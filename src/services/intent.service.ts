import * as createError from 'http-errors'
import { Intent, IntentModel } from '../models/intent'
import { TextContentModel } from '../models/text-content'
import { TextAnswerModel } from '../models/text-answer'
import NlpService from './nlp.service'

const debug = require('debug')('botcms:intent.service')

export class IntentService {
  getIntents() {
    return IntentModel.find()
  }

  async createIntent(intent: Intent) {
    const msg = new IntentModel({
      ...intent,
    })

    const error = msg.validateSync()
    if (error) throw error

    const response = await msg.save()
    this.trainNLP(NlpService)
    return response
  }

  async updateIntent(_id: string, intent: Intent) {
    const oldIntent = await IntentModel.findById(_id)

    if (!oldIntent) {
      throw createError(404, 'The intent is not existed')
    }

    const { ...newIntent } = intent
    const response = await oldIntent.updateOne({ $set: newIntent }, { runValidators: true })
    this.trainNLP(NlpService)
    return response
  }

  async deleteIntent(_id: string) {
    const response = await IntentModel.findByIdAndDelete(_id)
    this.trainNLP(NlpService)
    return response
  }

  async trainNLP(nlp) {
    TextContentModel.find({}, function(err, docsContents) {
      docsContents.forEach(function(content) {
        content.intentsObject.forEach(function(intent) {
          nlp.addDocument('pt', content.name, intent.name)
          debug('content: ' + content.name + ' | intent:' + intent.name)
          nlp.train()
        })
      })
    }).populate('intentsObject')
    TextAnswerModel.find({}, function(err, docsAnswer) {
      docsAnswer.forEach(function(answer) {
        answer.intentsObject.forEach(function(intent) {
          nlp.addAnswer('pt', intent.name, answer.name)
          debug('intent:' + intent.name + ' | answer: ' + answer.name)
          nlp.train()
        })
      })
    }).populate('intentsObject')
  }
}
