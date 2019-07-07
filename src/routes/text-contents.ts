import { Router, Request, Response, NextFunction } from 'express'
import { TextContentService } from '../services/text-content.service'

const textContentRouter = Router()
const textContentService = new TextContentService()

textContentRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const textContents = await textContentService.getContents()

    res.json(textContents)
  } catch (error) {
    next(error)
  }
})

textContentRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { body } = req

  try {
    const content = await textContentService.createContent(body)

    res.json(content)
  } catch (error) {
    next(error)
  }
})

textContentRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { body } = req
  const { id } = req.params

  try {
    await textContentService.updateContent(id, body)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

textContentRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  try {
    await textContentService.deleteContent(id)

    res.end()
  } catch (error) {
    next(error)
  }
})

export default textContentRouter
