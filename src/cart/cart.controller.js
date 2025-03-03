import Cart from './cart.model.js'
import Product from '../product/product.model.js'

// Añadir producto al carrito
export const addToCart = async (req, res) => {
    try {
        const userId = req.user._id
        const { productId, quantity = 1 } = req.body
        
        // Verificar que el producto exista y tenga stock
        const product = await Product.findOne({ _id: productId, status: true })
        if (!product) {
            return res.status(404).send({ message: 'Product not found or inactive' })
        }
        
        if (product.stock < quantity) {
            return res.status(400).send({ 
                message: `Not enough stock. Available: ${product.stock}, Requested: ${quantity}` 
            })
        }
        
        // Buscar carrito existente o crear uno nuevo
        let cart = await Cart.findOne({ user: userId, active: true })
        
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity }]
            })
        } else {
            // Verificar si el producto ya está en el carrito
            const itemIndex = cart.items.findIndex(item => 
                item.product.toString() === productId
            )
            
            if (itemIndex > -1) {
                // Actualizar cantidad si ya existe
                cart.items[itemIndex].quantity += quantity
            } else {
                // Añadir nuevo item
                cart.items.push({ product: productId, quantity })
            }
        }
        
        await cart.save()
        
        // Devolver carrito con productos populados
        const populatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price stock')
        
        return res.status(200).send({ 
            message: 'Product added to cart successfully',
            cart: populatedCart
        })
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error adding product to cart', error })
    }
}

// Obtener el carrito del usuario
export const getCart = async (req, res) => {
    try {
        const userId = req.user._id
        
        const cart = await Cart.findOne({ user: userId, active: true })
            .populate('items.product', 'name description price stock')
        
        if (!cart) {
            return res.status(200).send({ 
                message: 'Cart is empty',
                cart: { items: [] }
            })
        }
        
        return res.status(200).send({ cart })
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting cart', error })
    }
}

// Actualizar cantidad de un producto en el carrito
export const updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id
        const { productId, quantity } = req.body
        
        if (quantity < 1) {
            return res.status(400).send({ message: 'Quantity must be at least 1' })
        }
        
        // Verificar stock
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).send({ message: 'Product not found' })
        }
        
        if (product.stock < quantity) {
            return res.status(400).send({ 
                message: `Not enough stock. Available: ${product.stock}, Requested: ${quantity}` 
            })
        }
        
        const cart = await Cart.findOne({ user: userId, active: true })
        
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' })
        }
        
        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
        )
        
        if (itemIndex === -1) {
            return res.status(404).send({ message: 'Product not found in cart' })
        }
        
        cart.items[itemIndex].quantity = quantity
        await cart.save()
        
        const updatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price stock')
        
        return res.status(200).send({ 
            message: 'Cart updated successfully',
            cart: updatedCart
        })
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating cart', error })
    }
}

// Eliminar un producto del carrito
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id
        const { productId } = req.params
        
        const cart = await Cart.findOne({ user: userId, active: true })
        
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' })
        }
        
        cart.items = cart.items.filter(item => 
            item.product.toString() !== productId
        )
        
        await cart.save()
        
        return res.status(200).send({ 
            message: 'Product removed from cart successfully',
            cart
        })
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error removing product from cart', error })
    }
}

// Vaciar el carrito
export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id
        
        const cart = await Cart.findOne({ user: userId, active: true })
        
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' })
        }
        
        cart.items = []
        await cart.save()
        
        return res.status(200).send({ message: 'Cart cleared successfully' })
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error clearing cart', error })
    }
}