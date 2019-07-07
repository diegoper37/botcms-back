import { Router } from 'express'
import NlpRouter from './nlp'
import IntentRouter from './intents'
import TextContentRouter from './text-contents'
import TextAnswerRouter from './text-answer'
import AuthRouter from './auth'
import UserRouter from './user'

import { isAuthenticate } from '../utils/middleware'

const router = Router()
router.use('/nlp', NlpRouter)
router.use('/intents', IntentRouter)
router.use('/text-contents', TextContentRouter)
router.use('/text-answer', TextAnswerRouter)
router.use('/auth', AuthRouter)
router.use('/users', UserRouter)

export default router
