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