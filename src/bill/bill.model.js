import { Schema, model } from 'mongoose'

const billSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product is required']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: [true, 'Price is required']
        },
        subtotal: {
            type: Number,
            required: [true, 'Subtotal is required']
        }
    }],
    total: {
        type: Number,
        required: [true, 'Total is required']
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

export default model('Bill', billSchema)