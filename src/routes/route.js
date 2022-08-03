const express = require('express')
const {createUser, loginUser,getUserProfile, updateUser} = require('../controller/userController')
const {createProduct, getProduct, getProductById, updateProduct, deleteById} = require("../controller/productController")
const {createCart, updateCart, getCart, deleteCart} = require("../controller/cartController")
const { authentication } = require("../middleware/auth")
const router = express.Router()

router.post('/register', createUser)
router.post('/login', loginUser)
router.get("/user/:userId/profile", getUserProfile)
router.put("/user/:userId/profile", updateUser)

// <===========================> Product API's
router.post("/products", createProduct);
router.get("/products", getProduct);
router.get("/products/:productId", getProductById);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteById);

// <========================>Cart API's

router.post("/users/:userId/cart", createCart)
router.put("/users/:userId/cart", updateCart)
router.get("/users/:userId/cart", getCart)
router.delete("/users/:userId/cart", deleteCart)


//Validating the endpoint
router.all("/*", function (req, res) {
    return res
    .status(404)
    .send({ status: false, message: "Page Not Found" });
});


module.exports = router
