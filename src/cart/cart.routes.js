import { Router } from 'express'
import { validateJwt } from '../../middlewares/validate.jwt.js'
import { validateClient } from '../../middlewares/validates.client.js'
import { addToCart, getCart, updateCartItem, removeFromCart, clearCart} from './cart.controller.js'

const api = Router()

// Todas las rutas requieren autenticación y rol de cliente
api.post('/add', [validateJwt, validateClient], addToCart)
api.get('/get', [validateJwt, validateClient], getCart)
api.put('/update', [validateJwt, validateClient], updateCartItem)
api.delete('/delete/:productId', [validateJwt, validateClient], removeFromCart)
api.delete('/clear', [validateJwt, validateClient], clearCart)

export default api