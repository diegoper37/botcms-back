import { Router, Request, Response, NextFunction } from 'express'
import NlpService from '../services/nlp.service'

const nlpRouter = Router()

nlpRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await NlpService.process('pt', req.query.q)
    res.json(response)
  } catch (error) {
    next(error)
  }
})

export default nlpRouter
