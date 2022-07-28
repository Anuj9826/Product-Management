let express = require("express")
let router = express.Router()

let {  userRegistration, loginUser } = require("../controller/userController")





router.post("/register", userRegistration)
router.post('/Login', loginUser )
router.get('/user/:userId/profile', getUserProfile)

router.all("/**", function (req, res) {
    return res.status(404).send({ status: false, message: "Requested Api is Not Available" });
    });


module.exports = router;