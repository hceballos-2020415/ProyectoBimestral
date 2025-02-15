import Category from './category.model.js'

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
        
        // Eliminar (cambiar status a false)
        let deletedCategory = await Category.findOneAndUpdate(
            {_id: id},
            {status: false},
            {new: true}
        )
        
        return res.send({message: 'Category deleted successfully'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error deleting category'})
    }
}