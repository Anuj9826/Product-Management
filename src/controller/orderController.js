const cartModel = require("../models/cartModel")
const orderModel = require("../models/orderModel")
const userModel = require("../models/userModel");
const { isValidId, isValidRequest } = require("../validator/validation")


const createOrder = async function(req, res){
    try {
        const userId = req.params.userId
        let data = req.body

        if(!isValidRequest(data)){
            return res.status(400).send({
                status: false,
                message: "Please enter the details in request body"
            })
        }

        let {cartId, cancellable, status} = data

        if(!isValidId(userId)){
            return res.status(400).send({
                status: false,
                message: `User id ${userId} not valid`
            })
        }

        const checkUser = await userModel.findByID({_id: userId})
        if(!checkUser){
            return res.status(404).send({
                status: false,
                message: "User does not exist"
            })
        }
        if(!cartId){
            return res.status(400).send({
                status: false,
                message: "Cart id is required"
            })
        }

        if(!isValidId(cartId)){
            return res.status(400).send({
                status: false,
                message: `Cart id ${cartId} not valid`
            })
        }
        const cartExist = await cartModel.findById({_id: cartId})

        if(!cartExist){
            return res.status(404).send({
                status: false,
                message: "Cart not found"
            })
        }
        if(cartExist.userId != userId){
            return res.status(400).send({
                status: false,
                message: "Not a valid user"
            })
        }

        if (cancellable) {
            if (typeof cancellable != "boolean") {
              return res.status(400).send({
                status: false,
                message: "Cancellable should be true or false",
              });
            }
          }
      
          //Check status
          if (status) {
            let validStatus = ["pending", "completed", "canceled"];
            if (!validStatus.includes(status)) {
              return res.status(400).send({
                status: false,
                message: `status should be one of this :-"pending", "completed", "canceled"`,
              });
            }
            if (status == "completed" || status == "canceled") {
              return res.status(400).send({
                status: false,
                message: "status should be  pending while creating order",
              });
            }
          }
          let newQuantity = 0;
          for (let i = 0; i < cartExist.items.length; i++) {
            newQuantity = newQuantity + cartExist.items[i].quantity;
          }
          const newOrder = {
            userId: userId,
            items: cartExist.items,
            totalPrice: cartExist.totalPrice,
            totalItems: cartExist.totalItems,
            totalQuantity: newQuantity,
            cancellable,
            status,
          }; //Destructing object
      
          //After validation check successfully so create Order created
          const order = await orderModel.create(newOrder);
      
          await cartModel.findOneAndUpdate(
            { _id: cartId, userId: userId },
            { items: [], totalPrice: 0, totalItems: 0 }
          );
          return res.status(201).send({
            status: true,
            message: "Success",
            data: order,
          });
        } catch (err) {
          return res.status(500).send({ status: false, message: err.message });
        }
      };

//<<<<<<<<<<<<<<<<<<<<<Update Order >>>>>>>>>>>>>>>>>>>>>>>>>>>>
const updateOrder = async (req, res) => {
    try {
        let userId = req.params.userId;
    let data = req.body;
    let { orderId, status } = data; //Object Destruting
  
    //Check body data comming or not
    if (!isValidRequest(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter details to update" });
    }
  
    //Check user-Id valid or not
    if (!isValidId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "userId is Not Valid" });
    }
  
    //DB call in user-Id
    let findUser = await userModel.findById({ _id: userId });
    if (!findUser) {
      return res.status(404).send({ status: false, message: "User not found" });
    }
  
    //Check order-Id comming or not
    if (!orderId) {
      return res
        .status(400)
        .send({ status: false, message: "OrderId is required to update order" });
    }
  
    //Check oreder-Id valid or not
    if (!isValidId(orderId)) {
      return res
        .status(400)
        .send({ status: false, message: "orderId is Not Valid" });
    }
  
    //Db call in order-Id
    let findOrder = await orderModel.findOne({ _id: orderId, isDeleted: false });
  
    //Check order-Id valid or not
    if (!findOrder) {
      return res.status(404).send({ status: false, message: "Order not found" });
    }
  
    //so check user-Id & Order-Id valid or not
    if (findOrder.userId != userId) {
      return res.status(400).send({
        status: false,
        message: "Make sure UserId and OrderId are correct",
      });
    }
  
    //Check status is comming or not
    if (!status) {
      return res
        .status(400)
        .send({ status: false, message: "status is required to update order" });
    }
    let validStatus = ["pending", "completed", "canceled"];
    if (!validStatus.includes(status)) {
      return res.status(400).send({
        status: false,
        message: `status should be one of this :-"pending", "completed", "canceled"`,
      });
    }
  
    //Check order cancel or not
    if (findOrder.cancellable == false) {
      return res
        .status(400)
        .send({ status: false, message: "This order is not cancellable" });
    }
  
    //After validation so Update & Cancallable Order
    const updated = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { status: status },
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "Success",
      data: updated,
    });
    } catch (error) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = {createOrder, updateOrder}