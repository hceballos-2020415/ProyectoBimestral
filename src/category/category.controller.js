import Category from './category.model.js'
import Product from '../product/product.model.js'

export const save = async (req, res) => {
    try {
        // Verificar que tenga permisos de admin
        if(req.user.role !== 'ADMIN') return res.status(403).send({message: 'Unauthorized'})
        
        // Guardar la categoría
        let category = new Category(req.body)
        await category.save()
        
        return res.send({message: 'Category saved successfully', category})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error saving category', err})
    }
}

export const get = async (req, res) => {
    try {
        // Obtener todas las categorías activas
        let categories = await Category.find({status: true})
        return res.send({categories})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error getting categories', err})
    }
}

export const getById = async (req, res) => {
    try {
        // Obtener el id
        let { id } = req.params
        // Buscar la categoría
        let category = await Category.findOne({_id: id, status: true})
        // Validar que exista
        if(!category) return res.status(404).send({message: 'Category not found'})
        // Responder
        return res.send({category})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error getting category'})
    }
}

export const update = async (req, res) => {
    try {
        // Verificar que tenga permisos de admin
        if(req.user.role !== 'ADMIN') return res.status(403).send({message: 'Unauthorized'})
        
        // Obtener el id
        let { id } = req.params
        // Obtener los datos a actualizar
        let data = req.body
        // Validar que exista la categoría
        let category = await Category.findOne({_id: id, status: true})
        if(!category) return res.status(404).send({message: 'Category not found'})
        
        // Actualizar
        let updatedCategory = await Category.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )
        
        return res.send({message: 'Category updated successfully', category: updatedCategory})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating category'})
    }
}

export const deleteCategory = async (req, res) => {
    try {
        // Verificar que tenga permisos de admin
        if(req.user.role !== 'ADMIN') return res.status(403).send({message: 'Unauthorized'})
        
        // Obtener el id
        let { id } = req.params
        // Validar que exista la categoría
        let category = await Category.findOne({_id: id, status: true})
        if(!category) return res.status(404).send({message: 'Category not found'})
        
        // Buscar una categoría por defecto o crear una si no existe
        let defaultCategory = await Category.findOne({name: 'Uncategorized'})
        
        if(!defaultCategory) {
            defaultCategory = new Category({
                name: 'Uncategorized',
                description: 'Default category for products with no assigned category',
                status: true
            })
            await defaultCategory.save()
        }
        
        // Mover todos los productos de la categoría a eliminar a la categoría por defecto
        await Product.updateMany(
            {category: id, status: true},
            {category: defaultCategory._id}
        )
        
        // Eliminar (cambiar status a false)
        let deletedCategory = await Category.findOneAndUpdate(
            {_id: id},
            {status: false},
            {new: true}
        )
        
        return res.send({
            message: 'Category deleted successfully. All associated products have been moved to Uncategorized category'
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error deleting category'})
    }
}