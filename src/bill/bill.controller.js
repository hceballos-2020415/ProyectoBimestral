import Bill from './bill.model.js'
import Product from '../product/product.model.js'
import User from '../user/user.model.js'

export const createBill = async (req, res) => {
    try {
        const userId = req.user._id
        
        const { products } = req.body
        
        if (!products || products.length === 0) {
            return res.status(400).send({ message: 'Cart is empty' })
        }
        
        let total = 0
        let billProducts = []
        
        for (const item of products) {
            const product = await Product.findOne({ _id: item.productId, status: true })
            
            if (!product) {
                return res.status(404).send({ message: `Product with ID ${item.productId} not found or inactive` })
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).send({ 
                    message: `Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
                })
            }
            
            const subtotal = product.price * item.quantity
            
            billProducts.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                subtotal
            })
            
            total += subtotal
            
            await Product.findByIdAndUpdate(
                product._id,
                { $inc: { stock: -item.quantity } }
            )
        }
        
        const bill = new Bill({
            user: userId,
            products: billProducts,
            total
        })
        
        await bill.save()
        
        return res.status(201).send({ 
            message: 'Purchase completed successfully', 
            billId: bill._id,
            total 
        })
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error processing purchase', error })
    }
}

export const getUserBills = async (req, res) => {
    try {
        const userId = req.user._id
        
        const bills = await Bill.find({ user: userId, active: true })
            .populate('products.product', 'name price')
            .sort({ createdAt: -1 })
        
        return res.send({ bills })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting bills', error })
    }
}

export const getBillById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user._id
        
        const bill = await Bill.findOne({ _id: id, user: userId, active: true })
            .populate('products.product', 'name description price')
            .populate('user', 'name surname username email')
        
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found' })
        }
        
        return res.send({ bill })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting bill', error })
    }
}

export const getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find({ active: true })
            .populate('products.product', 'name price')
            .populate('user', 'name surname username')
            .sort({ createdAt: -1 })
        
        return res.send({ bills })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting bills', error })
    }
}

export const updateBillStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body
        
        if (!status || !['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
            return res.status(400).send({ message: 'Invalid status' })
        }
        
        const bill = await Bill.findOne({ _id: id, active: true })
        
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found' })
        }
        
        if (status === 'CANCELLED' && bill.status !== 'CANCELLED') {
            for (const item of bill.products) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity } }
                )
            }
        }
        
        bill.status = status
        await bill.save()
        
        return res.send({ message: 'Bill status updated successfully', bill })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating bill status', error })
    }
}

export const deleteBill = async (req, res) => {
    try {
        const { id } = req.params
        
        const bill = await Bill.findOneAndUpdate(
            { _id: id, active: true },
            { active: false },
            { new: true }
        )
        
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found' })
        }
        
        return res.send({ message: 'Bill deleted successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting bill', error })
    }
}