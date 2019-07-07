// import * as createError from 'http-errors'
// import { Message, MessageModel } from '../models/message'
// import { MessengerError } from '../common'
// import { MessagesAPI } from '../apis/graph'

import { TextContentModel } from '../models/text-content'
import { TextAnswerModel } from '../models/text-answer'
import { NlpManager } from 'node-nlp'
const debug = require('debug')('botcms:nlp.service')

class NlpService {
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

const nlp = new NlpManager({ languages: ['pt'] })
const nlpService = new NlpService()
debug('inicio do treinamento de nlp...')
nlpService.trainNLP(nlp)

export default nlp
