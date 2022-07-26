const userModel = require("../models/userModel")

const userLogin = async function(req, res){
    const data = req.body
    if (Object.keys(data).length == 0) {
        res.status(400).send({ status: false, message: 'Invalid request parameters, Please provide login details' })
        return
    }

    let {email, password } = data

    if (!(email)) {
        res.status(400).send({ status: false, message: `Email is required` })
        return
    }
    if (!(password)) {
        res.status(400).send({ status: false, message: `Email is required` })
        return
    }

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(404).send({status: false, message:`${email} not exit`})
    }

    let passwordVerify = await bcrypt.compare(password, match.password)
        if (!passwordVerify)
            return res.status(401).send({ status: false, msg: "invalid password" })


    const token = jwt.sign({
        userId: user._id
    }, 'FunctionUp', {
        expiresIn: '300s'
    });

    res.status(201).send({
        status: true,
        user: user._id,
        token: token 
    })

}

module.exports = { userLogin }