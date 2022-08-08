const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const {
    isValidId,
    isValidRequest,
    isValidString
} = require("../validator/validation");

const createCart = async function (req, res) {
    try {
        const data = req.body;
        const userId = req.params.userId;
        const userToken = req.userId;

        let { productId, quantity, cartId } = data;

        // if quantity does't exist then add 1 default
        if (!isValidId(userId)) {
        return res
            .status(400)
            .send({ status: false, message: "User not valid !" });
        }
        let validUser = await userModel.findById(userId);
        if (!validUser) {
        return res.status(404).send({
            status: false,
            message: "User not found !",
        });
        }

        if (validUser._id.toString() != userToken) {
        return res.status(403).send({
            status: false,
            message: "You are not valid user",
        });
        }
        if (!isValidRequest(data)) {
        return res.status(400).send({
            status: false,
            message: "Please add item in cart",
        });
        }

        if (!isValidString(productId)) {
        return res.status(400).send({
            status: false,
            message: "Please enter the product id",
        });
        }
        if (!isValidId(productId)) {
        return res.status(400).send({
            status: false,
            message: "Not a valid product id",
        });
        }
        if (quantity) {
        if (!isValidString(quantity)) {
            return res.status(400).send({
            status: false,
            message: "Please enter quantity",
            });
        }
        if (!quantity > 0) {
            return res.status(400).send({
            status: false,
            message: "Quantity should be Positive Numeric value",
            });
        }
        }
        if (!data?.quantity) {
        quantity = 1;
        }

        const product = await productModel.findOne({
        _id: productId,
        isDeleted: false,
        });
        if (!product) {
        return res
            .status(404)
            .send({ status: false, message: " productId not found!" });
        }
        
        const userCart = await cartModel.findOne({ userId: userId });
        if (!userCart) {
        const cartData = {
            userId: userId,
            items: [
            {
                productId: productId,
                quantity: quantity,
            },
            ],
            totalPrice: product.price * quantity,
            totalItems: 1,
        };
        const createCart = await cartModel.create(cartData);
        return res.status(201).send({
            status: true,
            message: "Success",
            data: createCart,
        });
        }

        if (cartId) {
        if (!isValidString(cartId)) {
            return res.status.send({
            status: false,
            message: "please enter the cart Id",
            });
        }
        let checkCart = await cartModel.findById(cartId);
        if (!checkCart) {
            return res.status(400).send({
            status: false,
            message: "Cart not found",
            });
        }
        if (cartId != userCart._id.toString()) {
            return res.status(200).send({
            status: true,
            message: "This cart id is not this user",
            });
        }
        }
        if (userCart) {
        const price = userCart.totalPrice + quantity * product.price;
        const cartItem = userCart.items;
        for (let item of cartItem) {
            if (item.productId.toString() === productId) {
            item.quantity += quantity;

            const updatedCart = {
                items: cartItem,
                totalPrice: price,
                totalItems: cartItem.length,
            };

            const saveCart = await cartModel.findOneAndUpdate(
                { _id: userCart._id },
                updatedCart,
                { new: true }
            );

            return res.status(200).send({
                status: true,
                message: "Success",
                data: saveCart,
            });
            }
        }

        cartItem.push({ productId: productId, quantity: quantity });

        const updatedCart = {
            items: cartItem,
            totalPrice: price,
            totalItems: cartItem.length,
        };

        const saveCart = await cartModel.findOneAndUpdate(
            { _id: userCart._id },
            updatedCart,
            { new: true }
        );

        return res.status(200).send({
            status: true,
            message: "Success",
            data: saveCart,
        });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


// <======================> Update Cart <=======================>

const updateCart = async function (req, res) {
    try {
    let userId = req.params.userId;
    const userToken = req.userId;
    let updateData = req.body;
    let { productId, cartId, removeProduct } = updateData;

    if (!isValidId(userId)) {
        return res
            .status(400)
            .send({ status: false, message: "User not valid !" });
        }
        const validUser = await userModel.findById(userId);
        if (!validUser) {
        return res.status(404).send({
            status: false,
            message: "User not found !",
        });
        }

        if (validUser._id.toString() != userToken) {
            return res.status(403).send({
                status: false,
                message: "You are not valid user",
            });
        }
        
    if (!isValidRequest(updateData)) {
        return res
        .status(400)
        .send({ status: false, message: "Please add items, cart can not be empty" });
    }
    if(!isValidId(cartId)){
        return res.status(400).send({
            status: false, 
            message: "Cart id not valid"
        });
    }
    if(!isValidString(cartId)){
        return res.status(400).send({
            status: false, 
            message: "Please enter cart id"
        });
    }
    let cart = await cartModel.findById({_id: cartId, userId: userId});
    if(!cart){
        return res.status(400).send({ status: false, message: "cart not found" });
    }
    if(!isValidString(productId)){
        return res.status(400).send({
            status: false,
            message: "Please enter product id"
        })
    }
    if(!isValidId(productId)){
        return res.status(400).send({
            status: false,
            message: "Product Id is not valid"
        })
    }

    let product = await productModel.findOne({
        _id: productId,
        isDeleted: false,
    });
    
    if (!product) {
        return res
            .status(400)
            .send({ status: false, message: "product not found" });
    }
    if(!isValidString(removeProduct)){
        return res.status(400).send({
            status: false, 
            message: "Remove product should be number"
        });
    }
    if (isNaN(Number(removeProduct))) {
        return res.status(400).send({
            status: false,
            message: `removeProduct should be a valid number either 0 or 1`,
        });
    }

    if (!(removeProduct === 0 || removeProduct === 1)) {
        return res.status(400).send({
            status: false,
            message: "Please provide removeProduct as 1 to delete particular quantity of given product and 0 to delete the product itself",
        });
    }

    let checkQuantity = checkCart.items.find(
        (item) => item.productId.toString() === productId
    );

    if (!checkQuantity){
        return res.status(400).send({
            status: false,
            message: `The product is already remove with ${productId} this productId`,
        });
    }
    if (removeProduct === 0) {
        let totalAmount =cart.totalPrice - product.price * checkQuantity.quantity;
        let updatedCart = await cartModel.findOneAndUpdate(
        { _id: cartId },
        {
            $pull: { items: { productId: productId } },
            $set: { totalPrice: totalAmount },
            $inc: { totalItems: -1 },
        },
        { new: true }
        );
        return res.status(200).send({
            status: true,
            msg: "Success",
            data: updatedCart,
        });
    }

    if (removeProduct === 1) {
        let totalAmount = cart.totalPrice - product.price;
        let itemsArr = cart.items;

    for (let item of itemsArr) {
        if (item.productId.toString() == productId) {
            item.quantity = item.quantity - 1;
            if (checkQuantity.quantity > 0) {
                let updatedCart = await cartModel.findOneAndUpdate(
                    { _id: cartId },
                    { $set: { totalPrice: totalAmount, items: itemsArr } },
                    { new: true }
                );
                return res.status(200).send({
                    status: true,
                    msg: "Success",
                    data: updatedCart,
                });
            }
        }
    }
    let updatedCart = await cartModel.findOneAndUpdate(

        { _id: cartId },
        {
            $pull: { items: { productId: productId } },
            $set: { totalPrice: totalAmount },
            $inc: { totalItems: -1 },
        },
        { new: true }
    );
    return res.status(200).send({
        status: true,
        msg: "Success",
        data: updatedCart,
    });
    }
    } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
    }
};


//<================> Get Cart<=======================>
const getCart = async function(req, res){
    try {
        const userId = req.params.userId
        const tokenUser = req.userId

        if(!isValidId(userId)){
            return res.status(404).send({
                status: false,
                message: "Not valid user id"
            })
        }

        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).send({
                status: false,
                message: "User not found"
            })
        }
        if(user._id.toString() != tokenUser){
            return res.status(404).send({
                status: false,
                message: "You are not valid user"
            })
        }
        // make sure cart exist
        const checkCart = await cartModel.findOne({userId: userId})

        if(!checkCart){
            return res.status(404).send({
                status: false,
                message: "Cart not found"
            })
        }

        return res.status(200).send({
            status: true,
            message: "Success",
            data: checkCart
        })
    } catch (error) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


// <=======================> Delete cart <==================>
const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        let userIdToken = req.userId;

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" });
        }
        const checkUser = await userModel.findById(userId);
        if (!checkUser) {
            return res.status(404).send({ status: false, message: "user not found" });
        }

        if (checkUser._id.toString() != userIdToken) {
            return res
            .status(403)
            .send({ status: false, message: `You are Not Authorized` });
        }

        const findCart = await cartModel.findOne({ userId });
        if (!findCart) {
            return res.status(400).send({ status: false, message: "cart not found" });
        }

        const deleteCart = await cartModel.findOneAndUpdate(
            { userId: userId },
            { $set: { items: [], totalPrice: 0, totalItems: 0 } }
        );
        //console.log(deleteCart)

        return res
            .status(200)
            .send({ status: true, message: "Success" });
    } catch (err) {

        return res.status(500).send({ status: false, error: err.message });
    }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
