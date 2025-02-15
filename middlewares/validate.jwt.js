'use strict'

import jwt from 'jsonwebtoken'
import User from '../src/user/user.model.js'

export const validateJwt = async(req, res, next) => {
    try {
        const token = req.headers.authorization
        if(!token) {
            return res.status(401).send({
                message: 'No token provided'
            })
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        
        const user = await User.findById(decoded.uid)
        if(!user) {
            return res.status(401).send({
                message: 'User not found'
            })
        }
        if(!user.status) {
            return res.status(401).send({
                message: 'User is inactive'
            })
        }

        req.user = user
        next()
    } catch(error) {
        console.error(error)
        return res.status(401).send({
            message: 'Invalid token'
        })
    }
}

export const isAdmin = async(req, res, next) => {
    try {
        const { user } = req
        if(!user || user.role !== 'ADMIN') {
            return res.status(403).send({
                message: `You don't have access | username ${user.username}`
            })
        }
        next()
    } catch(error) {
        console.error(error)
        return res.status(403).send({
            message: 'Unauthorized access'
        })
    }
}