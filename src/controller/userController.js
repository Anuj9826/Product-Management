const userModel = require("..models/userModel")
const validation = require('..validator/validation')




const registration = async function(req, res) {

    try{
        let data = req.body;
        const {fname, lname, email, profileImage, phone, password, address} = data;

        if (!validation.isBodyEmpty(data)) return res.status(400).send({ status: false, message: "Please provide required data" });
        if (!validation.isValid(fname)) return res.status(400).send({ status: false, message: "fname tag is required" });
        if (!validation.isValid(lname)) return res.status(400).send({ status: false, message: "lname tag is required" });
        if (!validation.isValid(email)) return res.status(400).send({ status: false, message: "email tag is required" });
        if (!validation.isValid(phone)) return res.status(400).send({ status: false, message: "phone tag is required" });
        if (!validation.isValid(password)) return res.status(400).send({ status: false, message: "password tag is required" });

        if (validation.isVerifyString(fname)) return res.status(400).send({ status: false, message: "fname doesn't contains any digit or symbols" });
        if (validation.isVerifyString(lname)) return res.status(400).send({ status: false, message: "lname doesn't contains any digit or symbols" });
        if (!validation.validateEmail(email)) return res.status(400).send({ status: false, message: "Email is Invalid" });
        if (!validation.isValidMobileNo(phone)) return res.status(400).send({ status: false, message: "Mobile number is Invalid" });
        if (password.length < 8) return res.status(400).send({ status: false, message: "password is too short" });
        if (password.length >= 16) return res.status(400).send({ status: false, message: "password is too Long" });



        let save = await userModel.create(data);
        res.status(201).send({status:"true", msg:"success", data:"save" })

    }catch (error) {
        res.status(500).send({ status: false, message: error.message });
