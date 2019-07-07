import { Router, Request, Response, NextFunction } from 'express'
import { TextAnswerService } from '../services/text-answer.service'

const textAnswerRouter = Router()
const textAnswerService = new TextAnswerService()

textAnswerRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const textAnswers = await textAnswerService.getAnswers()

    res.json(textAnswers)
  } catch (error) {
    next(error)
  }
})

textAnswerRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { body } = req

  try {
    const answer = await textAnswerService.createAnswer(body)

    res.json(answer)
  } catch (error) {
    next(error)
  }
})

textAnswerRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { body } = req
  const { id } = req.params

  try {
    await textAnswerService.updateAnswer(id, body)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

textAnswerRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  try {
    await textAnswerService.deleteAnswer(id)

    res.end()
  } catch (error) {
    next(error)
  }
})

export default textAnswerRouter
