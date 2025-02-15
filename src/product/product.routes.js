import { Router } from 'express'
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js'
import { create, getAll, getById, update, deleteProduct } from './product.controller.js'

const api = Router()

// Rutas públicas
api.get('/getAll', getAll)
api.get('/get/:id', getById)

// Rutas protegidas (solo admin)
api.post('/create', [validateJwt, isAdmin], create)
api.put('/update/:id', [validateJwt, isAdmin], update)
api.delete('/delete/:id', [validateJwt, isAdmin], deleteProduct)

export default api