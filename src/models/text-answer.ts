import { Schema, Document, model } from 'mongoose'
import { Intent } from './intent'

export interface TextAnswer extends Document {
  readonly name: string
  readonly intents: string[]
  readonly intentsObject: Intent[]
  readonly active: boolean
  readonly createdBy: ''
  readonly updatedBy: ''
}

const TextAnswerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    intents: [
      {
        type: Schema.Types.ObjectId,
        // ref: 'Intent',
        validate: {
          validator: async function(_id: string) {
            const message = await model('Intent').findOne({ _id })
            return !!message
          },
          message: prop => `message with id ${prop.value} is not existed`,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

TextAnswerSchema.virtual('intentsObject', {
  ref: 'Intent', // The model to use
  localField: 'intents', // Find people where `localField`
  foreignField: '_id', // is equal to `foreignField`
})

export const TextAnswerModel = model<TextAnswer>('TextAnswer', TextAnswerSchema)
