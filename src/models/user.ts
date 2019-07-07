import { Schema, Document, model, Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

export interface User extends Document {
  readonly profile: {
    firstName: string
    lastName: string
  }
  readonly provider: 'Email' | 'Facebook'
  readonly email: string
  password: string
  readonly passwordReset?: {
    token: string
    expiration: Date
  }
  readonly role: 'client' | 'admin' | 'editor'
  readonly active: boolean
}

export interface UserDocument extends User, Document {
  generateAuthToken(): Promise<string>
  removeToken(token: string): Promise<void>
}

export interface UserModelInterface extends Model<UserDocument> {
  findByToken(token: string): Promise<UserDocument>
  findByCredentials(email: string, password: string): Promise<UserDocument>
}

const UserSchema = new Schema(
  {
    profile: {
      firstName: {
        type: String,
        lowercase: true,
        required: true,
      },
      lastName: {
        type: String,
        lowercase: true,
        required: true,
      },
    },
    provider: {
      type: String,
      required: true,
      enum: ['email', 'facebook'],
      default: 'email',
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    tokens: [
      {
        access: {
          type: String,
          required: true,
        },
        token: {
          type: String,
          required: true,
        },
      },
    ],
    passwordReset: {
      token: String,
      expiration: Date,
    },
    role: {
      type: String,
      enum: ['client', 'admin', 'editor'],
      default: 'client',
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
  },
)

/**
 * Remove `password` on the all get's by `user`
 */
UserSchema.set('toObject', {
  transform: (_doc, user, _opt) => {
    delete user.password
    return user
  },
})
UserSchema.set('toJSON', {
  transform: (_doc, user, _opt) => {
    delete user.password
    return user
  },
})

UserSchema.pre<User>('save', function(next) {
  // only hash the password if it has been modified (or is new)
  const user = this
  if (!this.isModified('password')) return next()

  // generate a salt
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err)

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err)

      // override the cleartext password with the hashed one
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.generateAuthToken = function() {
  const user = this
  const access = 'auth'
  const { JWT_TOKEN } = process.env
  const token = jwt.sign({ _id: user._id.toHexString(), access }, JWT_TOKEN)

  user.tokens.push({ access, token })

  return this.save().then(() => {
    return token
  })
}

UserSchema.methods.removeToken = function(token: string): Promise<void> {
  return this.update({
    $pull: {
      tokens: { token },
    },
  })
}

// Functions on user collection
UserSchema.statics.findByToken = function(token: string): Promise<User> {
  return new Promise(async (resolve, reject) => {
    try {
      const { JWT_TOKEN } = process.env
      let decoded
      decoded = jwt.verify(token, JWT_TOKEN)

      return this.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth',
      })
    } catch (error) {
      return reject()
    }
  })
}

UserSchema.statics.findByCredentials = async function(email: string, password: string) {
  return new Promise(async (resolve, reject) => {
    const user = await this.findOne({ email })
    if (!user) return reject('Email not found')

    bcrypt.compare(password, user.password, (err: Error, isMatch: boolean) => {
      if (!isMatch) return reject('Wrong password')

      return resolve(user)
    })
  })
}

export const UserModel = model<UserDocument, UserModelInterface>('User', UserSchema)
