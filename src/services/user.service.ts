import * as createError from 'http-errors'
import { UserModel, User } from '../models/user'

export class UserService {
  /**
   *
   */
  getUsers() {
    return UserModel.find()
  }

  /**
   *
   * @param user
   */
  async createUser(user: User) {
    const msg = new UserModel(user)

    const error = msg.validateSync()
    if (error) throw error

    const response = await msg.save()
    return response
  }

  /**
   *
   * @param email
   * @param password
   */
  async validateCredentials(email: string, password: string) {
    // console.log('create')
    // const test = await this.createUser({
    //   profile: {
    //     firstName: 'James',
    //     lastName: 'Bond',
    //   },
    //   email: email,
    //   password: password,
    // } as User)
    // console.log(test)
    // return
    const user = await UserModel.findByCredentials(email, password)
    const token = await user.generateAuthToken()

    return {
      user,
      token,
    }
  }

  /**
   *
   * @param _id
   * @param user
   */
  async updateUser(_id: string, user: User) {
    const oldUser = await UserModel.findById(_id)

    if (!oldUser) {
      throw createError(404, 'The user is not existed')
    }

    const { ...newUser } = user
    const response = await oldUser.updateOne({ $set: newUser }, { runValidators: true })
    return response
  }

  /**
   *
   * @param _id
   */
  async deleteUser(_id: string) {
    const response = await UserModel.findByIdAndDelete(_id)
    return response
  }
}
