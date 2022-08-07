const orderModel = require("../models/orderModel")
const { isValidString, isValidId, isValidRequest, isValidBoolean, isValidStatus } = require("../validator/validation")


const createOrder = async function(req, res){
    try {
        const user_Id = req.params.userId
        let data = req.body

        if(!isValidRequest(data)){
            return res.status(400).send({
                status: false,
                message: "Please enter the details in request body"
            })
        }

        let {userId, items, cancellable, status} = data

        if(!isValidString(userId)){
            return res.status(400).send({
                status: false,
                message: "Please enter user id"
            })
        }

        if(!isValidId(userId)){
            return res.status(400).send({
                status: false,
                message: `User id ${userId} not valid`
            })
        }

        const checkUser = await userModel.findOne({_id: userId})
        if(!checkUser){
            return res.status(404).send({
                status: false,
                message: "User does not exist"
            })
        }
        if(user_Id !== userId){
            return res.status(401).send({
                status: false,
                message: "Not a valid user"
            })
        }

        if(isValidString(items)){
            items = JSON.parse(items)
        }
        data.items = items

        if(!items.length){
            return res.status(400).send({
                status: false,
                message: "Item is empty"
            })
        }

        let totalPrice = 0
        let totalQuantity = 0

        for(let i=0; i< items.length; i++){
            if(!isValidString(items[i].productId)){
                return res.status(400).send({
                    status: false,
                    message: "ProductId is empty"
                })
            }

            if(!isValidId(items[i].productId)){
                return res.status(400).send({
                    status: false,
                    message: "Product Id is invalid"
                })
            }

            const checkProduct = await productModel.findOne({_id: items[i].productId})
            if(!checkProduct){
                return res.status(400).send({
                    status: false,
                    message: "Product don't exist"
                })
            }

            if(!isValidString(items[i].quantity)){
                return res.status(400).send({
                    status: false,
                    message: "Quantity is empty"
                })
            }

            totalPrice += checkProduct.price;
            totalQuantity += items[i].quantity
        }

        data.totalPrice = totalPrice
        data.totalQuantity = totalQuantity
        data.totalItems = items.length

        if(!isValidBoolean(cancellable)){
            return res.status(400).send({
                status: false,
                message: "cancellable is invalid"
            })
        }

        if(!isValidStatus(status)){
            return res.status(400).send({
                status: false,
                message: "Status is invalid, accept only one of these value: 'pending', 'completed', 'cancelled'"
            })
        }

        let createdOrder = await orderModel.create(data);
        res.status(201).send({
            status: true,
            message: "Success",
            data: createdOrder,
        });
    } catch (error) {
        return res.status(500).send({ 
            status: false, 
            message: error.message 
        });
    }
}


const updateOrder = async function(res, req){
    try {
        const userId = req.params.userId
        const orderId = req.body.orderId

        if(!isValidString(orderId)){
            return res.status(400).send({
                status: false,
                message: "Please enter order id"
            })
        }

        if(!isValidId(orderId)){
            return res.status(400).send({
                status: false,
                message: "Order id is valid"
            })
        }

        const order = await orderModel.findOne({_id: orderId})

        if(!order){
            return res.status(400).send({
                status: false,
                message: "Order does not exist"
            })
        }

        if(order.userId.toString() != userId){
            return res.status(403).send({
                status: false,
                message: `You are logged in this user id ${userId}`
            })
        }

        if(order.status === "cancel"){
            return res.status(404).send({
                status: false,
                message: "Order already cancel"
            })
        }

        if(order.status === "completed"){
            return res.status(404).send({
                status: false,
                message: "Order completed You can't cancel"
            })
        }
        
        if(order.status === "pending"){
            order.status = "cancel" ;
            cancelledOrder = await order.save();
            return res.status(200).send({
                status: true,
                message: "Success"
            })
        }
    } catch (error) {
        return res.status(500).send({ 
            status: false, 
            message: error.message 
        });
    }
}

module.exports = {createOrder, updateOrder}