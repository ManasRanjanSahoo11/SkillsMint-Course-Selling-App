const jwt = require("jsonwebtoken")

function userAuth(req, res, next) {
    const token = req.headers.token;

    const decodedData = jwt.verify(token, process.env.JWT_USER_SECRET)

    if (decodedData) {
        req.userId = decodedData.userId
        next()
    } else {
        res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
}

function adminAuth(req, res, next){
    const token = req.headers.token;

    const decodedData = jwt.verify(token, process.env.JWT_ADMIN_SECRET)

    if (decodedData) {
        req.userId = decodedData.userId
        next()
    } else {
        res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
}

module.exports = {
    userAuth,
    adminAuth
}