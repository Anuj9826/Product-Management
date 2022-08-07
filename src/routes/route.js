const express = require('express')
const {createUser, loginUser,getUserProfile, updateUser} = require('../controller/userController')
const {createProduct, getProduct, getProductById, updateProduct, deleteById} = require("../controller/productController")
const {createCart, updateCart, getCart, deleteCart} = require("../controller/cartController")
const { authentication, authorization } = require("../middleware/auth")
const { updateOrder, createOrder } = require('../controller/orderController')
const router = express.Router()

router.post('/register', createUser)
router.post('/login', loginUser)
router.get("/user/:userId/profile",authentication , getUserProfile)
router.put("/user/:userId/profile",authentication, authorization, updateUser)

// <===========================> Product API's
router.post("/products", createProduct);
router.get("/products", getProduct);
router.get("/products/:productId", getProductById);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteById);

// <========================>Cart API's

router.post("/users/:userId/cart",authentication, createCart)
router.put("/users/:userId/cart",authentication, updateCart)
router.get("/users/:userId/cart",authentication, authorization, getCart)
router.delete("/users/:userId/cart",authentication,authorization, deleteCart)

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>> Order API's  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

router.post("/users/:userId/orders", authentication, authorization,createOrder)
router.put("/users/:userId/orders", authentication, authorization, updateOrder)
//Validating the endpoint
router.all("/*", function (req, res) {
    return res
    .status(404)
    .send({ status: false, message: "Page Not Found" });
});


module.exports = router
