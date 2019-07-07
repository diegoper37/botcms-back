import { Router, Request, Response, NextFunction, response } from 'express'
import { UserService } from '../services/user.service'

const authRouter = Router()
const userService = new UserService()

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  const { body } = req

  try {
    await userService.createUser(body)

    res.status(200).end()
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  try {
    const response: any = await userService.validateCredentials(email, password)

    res.json(response)
  } catch (error) {
    res.status(401).send({
      error: {
        message: 'Incorrect email or password',
      },
    })
  }
})

export default authRouter
