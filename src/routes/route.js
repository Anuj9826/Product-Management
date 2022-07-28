const express = require('express')
const {createUser, loginUser,getUserProfile, updateUser} = require('../controller/userController')
const { authentication } = require("../middleware/auth")
const router = express.Router()

router.post('/register', createUser)
router.post('/login', loginUser)
router.get("/user/:userId/profile", getUserProfile)
router.put("/user/:userId/profile", updateUser)


//Validating the endpoint
router.all("/*", function (req, res) {
    return res
    .status(404)
    .send({ status: false, message: "Page Not Found" });
});


module.exports = router
