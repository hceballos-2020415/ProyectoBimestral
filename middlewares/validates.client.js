export const validateClient = async(req, res, next) => {
    try {
        const { user } = req
        if(!user || user.role !== 'CLIENT') {
            return res.status(403).send({
                message: 'Only clients can access this resource'
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