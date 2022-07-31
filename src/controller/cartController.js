const validation = require('../validator/validation')
const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')

const createCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const requestBody = req.body;
        const { quantity, productId } = requestBody
    }


 if (!validator.isValidRequestBody(requestBody)) {
        return res.status(400).send({ status: false, message: "Please provide valid request body" })
    }
}
if (!validator.isValidObjectId(userId)) {
    return res.status(400).send({ status: false, message: "Please provide valid User Id" })
}
if (!validator.isValidObjectId(productId) || !validator.isValid(productId)) {
    return res.status(400).send({ status: false, message: "Please provide valid Product Id" })
}

if (!validator.isValid(quantity) || !validator.validQuantity(quantity)) {
    return res.status(400).send({ status: false, message: "Please provide valid quantity & it must be greater than zero." })
}

catch (err) {
    res.status(500).send({ status: false, data: err.message });
}
}