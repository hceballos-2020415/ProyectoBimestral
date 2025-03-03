import { Router } from 'express'
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js'
import { validateClient } from '../../middlewares/validates.client.js'
import { createBill, getUserBills, getBillById, getAllBills, updateBillStatus, deleteBill } from './bill.controller.js'

const api = Router()

// Rutas de cliente
api.post('/create', [validateJwt, validateClient], createBill)
api.get('/my-bills', [validateJwt, validateClient], getUserBills)
api.get('/detail/:id', [validateJwt], getBillById)

// Rutas de admin
api.get('/all', [validateJwt, isAdmin], getAllBills)
api.put('/update-status/:id', [validateJwt, isAdmin], updateBillStatus)
api.delete('/delete/:id', [validateJwt, isAdmin], deleteBill)

export default api