import { Schema, Document, model } from 'mongoose'

export interface Intent extends Document {
  readonly name: string
  readonly active: boolean
  readonly createdBy: ''
  readonly updatedBy: ''
}

const IntentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
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

export const IntentModel = model<Intent>('Intent', IntentSchema)
