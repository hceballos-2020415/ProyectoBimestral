import { body, param } from "express-validator"
import { validateErrors } from "./validate.error.js"
import { existUsername, existEmail, existCategory, existProduct } from "./db.validators.js"

export const registerValidator = [
    body('name', 'Name is required')
        .notEmpty()
        .isLength({min: 2, max: 50})
        .withMessage('Name must be between 2 and 50 characters'),
    body('surname', 'Surname is required')
        .notEmpty()
        .isLength({min: 2, max: 50})
        .withMessage('Surname must be between 2 and 50 characters'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .custom(existEmail),
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({min: 4, max: 20})
        .withMessage('Username must be between 4 and 20 characters')
        .custom(existUsername),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one symbol'),
    body('phone')
        .notEmpty().withMessage('Phone is required')
        .isMobilePhone()
        .withMessage('Invalid phone number format'),
    validateErrors
]

export const loginValidator = [
    body('username', 'Username is required ')
        .notEmpty()
        .toLowerCase(),
    body('password', 'Password is required')
        .notEmpty(),
    validateErrors
]

export const categoryValidator = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({min: 2, max: 50})
        .withMessage('Name must be between 2 and 50 characters'),
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({min: 10, max: 255})
        .withMessage('Description must be between 10 and 255 characters'),
    validateErrors
]

export const productValidator = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({min: 2, max: 100})
        .withMessage('Name must be between 2 and 100 characters'),
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({min: 10, max: 500})
        .withMessage('Description must be between 10 and 500 characters'),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isInt({ min: 0 })
        .withMessage('Stock must be a positive integer'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Invalid category ID')
        .custom(existCategory),
    validateErrors
]

export const billCreateValidator = [
    body('products')
        .isArray().withMessage('Products must be an array')
        .notEmpty().withMessage('Products array cannot be empty'),
    body('products.*.productId')
        .isMongoId().withMessage('Invalid product ID')
        .custom(existProduct),
    body('products.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validateErrors
]

