import Product from './product.model.js'
import Category from '../category/category.model.js'

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
