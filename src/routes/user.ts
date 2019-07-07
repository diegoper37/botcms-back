import { Router, Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'

const userRouter = Router()
const userService = new UserService()

userRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getUsers()

    res.json(users)
  } catch (error) {
    next(error)
  }
})

userRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { body } = req
  const { id } = req.params

  try {
    await userService.updateUser(id, body)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

userRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  try {
    await userService.deleteUser(id)

    res.end()
  } catch (error) {
    next(error)
  }
})

export default userRouter
