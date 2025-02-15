import { Schema, model } from 'mongoose'

const categorySchema = Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

export default model('Category', categorySchema)
