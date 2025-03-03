import { Router } from 'express'
import { login, register } from './auth.controller.js'
import { loginValidator, registerValidator } from '../../helpers/validators.js'

const api = Router()

// Ruta protegida para administradores (crear usuarios con cualquier rol)
api.post('/register', [registerValidator], register)

api.post('/login', [loginValidator], login)

export default api