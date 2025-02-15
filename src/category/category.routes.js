import { Router } from 'express'
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js'
import { save, get, getById, update, deleteCategory } from './category.controller.js'

const api = Router()

api.get('/get', get)
api.get('/get/:id', getById)

api.post('/save', [validateJwt, isAdmin], save)
api.put('/update/:id', [validateJwt, isAdmin], update)
api.delete('/delete/:id', [validateJwt, isAdmin], deleteCategory)

export default api