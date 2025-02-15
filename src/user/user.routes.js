import { Router } from "express"
import { getAll, updateUser, updatePassword, deleteUser } from "./user.controller.js"
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js'

const api = Router()

api.get('/all', [validateJwt, isAdmin], getAll)
api.put('/update/:id', [validateJwt], updateUser)
api.put('/update-password/:id', [validateJwt], updatePassword)
api.delete('/delete/:id', [validateJwt], deleteUser)

export default api