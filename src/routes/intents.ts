import { Router, Request, Response, NextFunction } from 'express'
import { IntentService } from '../services/intent.service'

const intentRouter = Router()
const intentService = new IntentService()

intentRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const intents = await intentService.getIntents()

    res.json(intents)
  } catch (error) {
    next(error)
  }
})

intentRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { body } = req

  try {
    const intent = await intentService.createIntent(body)

    res.json(intent)
  } catch (error) {
    next(error)
  }
})

intentRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { body } = req
  const { id } = req.params

  try {
    await intentService.updateIntent(id, body)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

intentRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  try {
    await intentService.deleteIntent(id)

    res.end()
  } catch (error) {
    next(error)
  }
})

export default intentRouter
