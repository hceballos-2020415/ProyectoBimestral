import Product from './product.model.js'
import Category from '../category/category.model.js'
import Bill from '../bill/bill.model.js'


// Crear producto
export const create = async (req, res) => {
    try {
        // Verificar que la categoría exista y esté activa
        const categoryExists = await Category.findOne({ _id: req.body.category, status: true })
        if (!categoryExists) return res.status(404).send({ message: 'Category not found or inactive' })

        // Crear y guardar el producto
        const product = new Product(req.body)
        await product.save()

        return res.status(201).send({ message: 'Product created successfully', product })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error creating product', err })
    }
}

// Obtener todos los productos
export const getAll = async (req, res) => {
    try {
        const products = await Product.find({ status: true })
            .populate('category', 'name description')
        return res.send({ products })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting products', err })
    }
}

// Obtener producto por ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findOne({ _id: id, status: true })
            .populate('category', 'name description')
        
        if (!product) return res.status(404).send({ message: 'Product not found' })
        return res.send({ product })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting product', err })
    }
}

// Buscar productos por nombre
export const searchByName = async (req, res) => {
    try {
        const { name } = req.body
        
        if (!name) {
            return res.status(400).send({ message: 'Search term is required' })
        }
        
        // Crear expresión regular para búsqueda insensible a mayúsculas/minúsculas
        const regex = new RegExp(name, 'i')
        
        const products = await Product.find({ 
            name: regex,
            status: true 
        }).populate('category', 'name description')
        
        return res.send({ 
            results: products.length,
            products 
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error searching products', err })
    }
}

// Obtener productos por categoría
export const getByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params
        
        // Verificar que la categoría exista
        const category = await Category.findOne({ _id: categoryId, status: true })
        if (!category) {
            return res.status(404).send({ message: 'Category not found' })
        }
        
        const products = await Product.find({ 
            category: categoryId,
            status: true 
        }).populate('category', 'name description')
        
        return res.send({ 
            category: category.name,
            results: products.length,
            products 
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting products by category', err })
    }
}

// Obtener productos más vendidos
export const getBestSellers = async (req, res) => {
    try {
        // Agregar para obtener los productos con más ventas
        const bestSellers = await Bill.aggregate([
            // Solo facturas activas y no canceladas
            { $match: { active: true, status: { $ne: 'CANCELLED' } } },
            // Desagregar los productos
            { $unwind: '$products' },
            // Agrupar por producto y sumar cantidades
            { 
                $group: { 
                    _id: '$products.product', 
                    totalSold: { $sum: '$products.quantity' }
                } 
            },
            // Ordenar por cantidad vendida (descendente)
            { $sort: { totalSold: -1 } },
            // Limitar a los 10 más vendidos
            { $limit: 10 }
        ])
        
        // Obtener información completa de los productos
        const productIds = bestSellers.map(item => item._id)
        
        const products = await Product.find({ 
            _id: { $in: productIds },
            status: true 
        }).populate('category', 'name')
        
        // Añadir la cantidad vendida a cada producto
        const productsWithSales = products.map(product => {
            const salesInfo = bestSellers.find(item => 
                item._id.toString() === product._id.toString()
            )
            return {
                ...product.toObject(),
                totalSold: salesInfo ? salesInfo.totalSold : 0
            }
        })
        
        // Ordenar por cantidad vendida
        productsWithSales.sort((a, b) => b.totalSold - a.totalSold)
        
        return res.send({ bestSellers: productsWithSales })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting best sellers', err })
    }
}

// Actualizar producto
export const update = async (req, res) => {
    try {
        const { id } = req.params
        const { category, ...updates } = req.body

        // Si se intenta actualizar la categoría, verificar que exista
        if (category) {
            const categoryExists = await Category.findOne({ _id: category, status: true })
            if (!categoryExists) return res.status(404).send({ message: 'Category not found or inactive' })
            updates.category = category
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, status: true },
            updates,
            { new: true }
        ).populate('category', 'name description')

        if (!updatedProduct) return res.status(404).send({ message: 'Product not found' })
        return res.send({ message: 'Product updated successfully', product: updatedProduct })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating product', err })
    }
}

// Eliminar producto (soft delete)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findOneAndUpdate(
            { _id: id, status: true },
            { status: false },
            { new: true }
        )

        if (!product) return res.status(404).send({ message: 'Product not found' })
        return res.send({ message: 'Product deleted successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting product', err })
    }
}
