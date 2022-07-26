let express = require("express")
let router = express.Router()

let { registration, userLogin } = require("../controller/userController")





router.post("/register", registration)
router.post('/Login', userLogin )


module.exports = router;