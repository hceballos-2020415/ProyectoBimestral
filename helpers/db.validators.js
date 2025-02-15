import User from '../src/user/user.model.js'
import Category from '../src/category/category.model.js'
import Product from '../src/product/product.model.js'

export const existUsername = async(username) => {
    const alreadyUsername = await User.findOne({username})
    if(alreadyUsername) {
        throw new Error(`Username ${username} is already taken`)
    }
}

export const existEmail = async(email) => {
    const alreadyEmail = await User.findOne({email})
    if(alreadyEmail) {
        throw new Error(`Email ${email} is already registered`)
    }
}

export const existCategory = async(id) => {
    const category = await Category.findById(id)
    if(!category) {
        throw new Error(`Category with id ${id} not found`)
    }
}

export const existProduct = async(id) => {
    const product = await Product.findById(id)
    if(!product) {
        throw new Error(`Product with id ${id} not found`)
    }
}