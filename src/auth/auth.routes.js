import { Router } from 'express'
import { login, register, test } from './auth.controller.js'
import { validateJwt } from '../../middlewares/validate.jwt.js'
import { loginValidator, registerValidator } from '../../helpers/validators.js'

const api = Router()

api.post('/register', [registerValidator], register)
api.post('/login', [loginValidator], login)
api.get('/test', validateJwt, test)

export default api
