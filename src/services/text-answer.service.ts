import * as createError from 'http-errors'
import { TextAnswer, TextAnswerModel } from '../models/text-answer'
import { TextContentModel } from '../models/text-content'
import NlpService from './nlp.service'
const debug = require('debug')('botcms:text-answer.service')

export class TextAnswerService {
  getAnswers() {
    return TextAnswerModel.find().populate('intentsObject')
  }

  async createAnswer(answer: TextAnswer) {
    const msg = new TextAnswerModel({
      ...answer,
    })

    const error = msg.validateSync()
    if (error) throw error

    const response = await msg.save()
    this.trainNLP(NlpService)
    return response
  }

  async updateAnswer(_id: string, answer: TextAnswer) {
    const oldAnswer = await TextAnswerModel.findById(_id)

    if (!oldAnswer) {
      throw createError(404, 'The answer is not existed')
    }

    const { ...newAnswer } = answer
    const response = await oldAnswer.updateOne({ $set: newAnswer }, { runValidators: true })
    this.trainNLP(NlpService)
    return response
  }

  async deleteAnswer(_id: string) {
    const response = await TextAnswerModel.findByIdAndDelete(_id)
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
