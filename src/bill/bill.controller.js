import Bill from './bill.model.js'
import Product from '../product/product.model.js'
import User from '../user/user.model.js'
import Cart from '../cart/cart.model.js'

export const createBill = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Revisar formato de datos y convertir si es necesario
        let productsToProcess = [];
        
        // Verificar si los datos vienen en formato x-www-form-urlencoded
        if (req.body['products[0][productId]'] !== undefined) {
            console.log("Datos en formato form-urlencoded detectados");
            
            // Convertir de formato form-urlencoded a array de objetos
            let index = 0;
            while (req.body[`products[${index}][productId]`] !== undefined) {
                productsToProcess.push({
                    productId: req.body[`products[${index}][productId]`],
                    quantity: parseInt(req.body[`products[${index}][quantity]`] || 1)
                });
                index++;
            }
            console.log("Productos procesados:", productsToProcess);
        } 
        // Verificar si hay productos en formato JSON estándar
        else if (req.body.products && Array.isArray(req.body.products)) {
            productsToProcess = req.body.products;
        }
        
        // Si no hay productos especificados, intentar usar el carrito
        if (productsToProcess.length === 0) {
            const cart = await Cart.findOne({ user: userId, active: true });
            
            if (!cart || !cart.items || cart.items.length === 0) {
                return res.status(400).send({ message: 'Cart is empty and no products specified in request' });
            }
            
            productsToProcess = cart.items.map(item => ({
                productId: item.product,
                quantity: item.quantity
            }));
        }
        
        console.log("Productos a procesar:", productsToProcess);
        
        if (productsToProcess.length === 0) {
            return res.status(400).send({ message: 'No products specified for the bill' });
        }
        
        let total = 0;
        let billProducts = [];
        
        // Procesar cada producto
        for (const item of productsToProcess) {
            // Asegurarse de que productId sea una cadena válida
            if (!item.productId) {
                return res.status(400).send({ 
                    message: 'Invalid product ID format' 
                });
            }
            
            const product = await Product.findOne({ _id: item.productId, status: true });
            
            if (!product) {
                return res.status(404).send({ 
                    message: `Product with ID ${item.productId} not found or inactive` 
                });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).send({ 
                    message: `Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
                });
            }
            
            const subtotal = product.price * item.quantity;
            
            billProducts.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                subtotal
            });
            
            total += subtotal;
            
            // Actualizar el stock del producto
            await Product.findByIdAndUpdate(
                product._id,
                { $inc: { stock: -item.quantity } }
            );
        }
        
        // Crear la factura
        const bill = new Bill({
            user: userId,
            products: billProducts,
            total
        });
        
        await bill.save();
        
        // Si se usó el carrito, vaciarlo
        const cart = await Cart.findOne({ user: userId, active: true });
        if (cart && productsToProcess.length > 0) {
            cart.items = [];
            await cart.save();
        }
        
        return res.status(201).send({ 
            message: 'Purchase completed successfully', 
            billId: bill._id,
            total 
        });
        
    } catch (error) {
        console.error('Error en createBill:', error);
        return res.status(500).send({ 
            message: 'Error processing purchase', 
            error: error.message 
        });
    }
}

// El resto de las funciones se mantienen igual
export const getUserBills = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const bills = await Bill.find({ user: userId, active: true })
            .populate('products.product', 'name price')
            .sort({ createdAt: -1 });
        
        return res.send({ bills });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error getting bills', error: error.message });
    }
}

export const getBillById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const bill = await Bill.findOne({ _id: id, user: userId, active: true })
            .populate('products.product', 'name description price')
            .populate('user', 'name surname username email');
        
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found' });
        }
        
        return res.send({ bill });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error getting bill', error: error.message });
    }
}

export const getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find({ active: true })
            .populate('products.product', 'name price')
            .populate('user', 'name surname username')
            .sort({ createdAt: -1 });
        
        return res.send({ bills });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error getting bills', error: error.message });
    }
}

export const updateBillStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
            return res.status(400).send({ message: 'Invalid status' });
        }
        
        const bill = await Bill.findOne({ _id: id, active: true });
        
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found' });
        }
        
        if (status === 'CANCELLED' && bill.status !== 'CANCELLED') {
            for (const item of bill.products) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity } }
                );
            }
        }
        
        bill.status = status;
        await bill.save();
        
        return res.send({ message: 'Bill status updated successfully', bill });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating bill status', error: error.message });
    }
}

export const deleteBill = async (req, res) => {
    try {
        const { id } = req.params;
        
        const bill = await Bill.findOneAndUpdate(
            { _id: id, active: true },
            { active: false },
            { new: true }
        );
        
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found' });
        }
        
        return res.send({ message: 'Bill deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error deleting bill', error: error.message });
    }
}