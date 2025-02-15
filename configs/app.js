'use strict'

import express from "express"
import morgan from "morgan"
import helmet from "helmet"
import cors from 'cors'

import { limiter } from "../middlewares/rate.limit.js"
import authRoutes from '../src/auth/auth.routes.js'
import userRoutes from '../src/user/user.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import productRoutes from '../src/product/product.routes.js'

const configs = (app) => {
    app.use(express.json())
    app.use(express.urlencoded({extended: false}))
    app.use(cors())
    app.use(helmet())
    app.use(limiter)
    app.use(morgan('dev'))
}

const routes = (app) => {
    app.use('/auth', authRoutes)
    app.use('/api/user', userRoutes)
    app.use('/api/category', categoryRoutes)
    app.use('/api/product', productRoutes)
}

export const initServer = async() => {
    const app = express()
    try {
        configs(app)
        routes(app)
        return app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        })
    } catch(err) {
        console.error('Server init failed', err)
        return err
    }
}
