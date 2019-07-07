import { UserModel, UserDocument } from '../models/user'

export const isAuthenticate = (req, res, next) => {
  let token = req.header('x-auth')

  return new Promise(async (resolve, reject) => {
    try {
      const user: UserDocument = await UserModel.findByToken(token)
      if (!user) {
        return reject(undefined)
      }

      req.user = user
      req.token = token
      next()
    } catch (error) {
      res.status(401).send()
    }
  })
}
