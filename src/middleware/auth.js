let jwt = require("jsonwebtoken")


const authentication = function (req, res, next) {
    try {
        let token = req.headers.authorization

        if(!token){
            res.status(400).send({
                status: false, message: "Please provide token "
            })
        }

        jwt.verify(token, "FunctionUp",(err, user) => {
            if(err){
                return res.status(401).send({status: false, message: "Invalid token"})
            }
            req.user = user

            next()
        })

    } catch (error) {
        res.status(500).send({
            status: false,
            messsage: err.message,
            });
    }
        
}

module.exports = { authentication }
