const jwt = require("jsonwebtoken")

const isAuthenticated = async function (req, res, next) {
    try {
        let token = (req.headers["x-api-key"])

        console.log(req.headers)
        if (!token) {
            return res.status(400).send({
                 status: false, 
                 message: 'You are not logged in, Please login to proceed your request' })
        }
        let decodedToken
        try {
            decodedToken = jwt.verify(token, "covid")
        } catch (error) {
            return res.status(400).send({ status: false, msg: "INVALID TOKEN" })
        }
        req.userId = decodedToken.id
        req.userType = decodedToken.type
        next();

    } catch (error) {
        return res.status(500).send({
             status: false,
             msg: error.message
             })
    }
}

const isAdmin =  async  (req, res, next) => {
    try {
        if(req.userType=="admin") next()
        else
        return res.status(403).send({
            status:"Failure",
            message:"You'r unauthorised for this operation"
        })
        
    } catch (error) {
        return res.status(500).send({ 
            status: false,
             msg: error.message 
            })
    }
}




module.exports = {isAuthenticated,isAdmin}