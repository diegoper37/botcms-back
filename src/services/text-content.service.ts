import * as createError from 'http-errors'
import { TextContent, TextContentModel } from '../models/text-content'
import { TextAnswerModel } from '../models/text-answer'
import NlpService from '../services/nlp.service'
const debug = require('debug')('botcms:text-content.service')

export class TextContentService {
  getContents() {
    return TextContentModel.find().populate('intentsObject')
  }

  async createContent(content: TextContent) {
    const msg = new TextContentModel({
      ...content,
    })

    const error = msg.validateSync()
    if (error) throw error

    const response = await msg.save()
    this.trainNLP(NlpService)
    return response
  }

  async updateContent(_id: string, content: TextContent) {
    const oldContent = await TextContentModel.findById(_id)

    if (!oldContent) {
      throw createError(404, 'The content is not existed')
    }

    const { ...newContent } = content
    const response = await oldContent.updateOne({ $set: newContent }, { runValidators: true })
    this.trainNLP(NlpService)
    return response
  }

  async deleteContent(_id: string) {
    const response = await TextContentModel.findByIdAndDelete(_id)
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
