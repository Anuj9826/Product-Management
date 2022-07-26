const userModel = require("..models/userModel");
const validation = require("..validator/validation");

const registration = async function (req, res) {
  try {
    let data = req.body;
    const { fname, lname, email, profileImage, phone, password, address } =
      data;

    if (!validation.isBodyEmpty(data))
      return res
        .status(400)
        .send({ status: false, message: "Please provide required data" });
    if (!validation.isValid(fname))
      return res
        .status(400)
        .send({ status: false, message: "fname tag is required" });
    if (!validation.isValid(lname))
      return res
        .status(400)
        .send({ status: false, message: "lname tag is required" });
    if (!validation.isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "email tag is required" });
    if (!validation.isValid(phone))
      return res
        .status(400)
        .send({ status: false, message: "phone tag is required" });
    if (!validation.isValid(password))
      return res
        .status(400)
        .send({ status: false, message: "password tag is required" });

    if (validation.isVerifyString(fname))
      return res
        .status(400)
        .send({
          status: false,
          message: "fname doesn't contains any digit or symbols",
        });
    if (validation.isVerifyString(lname))
      return res
        .status(400)
        .send({
          status: false,
          message: "lname doesn't contains any digit or symbols",
        });
    if (!validation.validateEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Email is Invalid" });
    if (!validation.isValidMobileNo(phone))
      return res
        .status(400)
        .send({ status: false, message: "Mobile number is Invalid" });
    if (password.length < 8)
      return res
        .status(400)
        .send({ status: false, message: "password is too short" });
    if (password.length >= 16)
      return res
        .status(400)
        .send({ status: false, message: "password is too Long" });

    let save = await userModel.create(data);
    res.status(201).send({ status: "true", msg: "success", data: "save" });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const userModel = require("../models/userModel");

const userLogin = async function (req, res) {
  const data = req.body;
  if (Object.keys(data).length == 0) {
    res
      .status(400)
      .send({
        status: false,
        message: "Invalid request parameters, Please provide login details",
      });
    return;
  }

  let { email, password } = data;

  if (!email) {
    res.status(400).send({ status: false, message: `Email is required` });
    return;
  }
  if (!password) {
    res.status(400).send({ status: false, message: `Email is required` });
    return;
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .send({ status: false, message: `${email} not exit` });
  }

  let passwordVerify = await bcrypt.compare(password, match.password);
  if (!passwordVerify)
    return res.status(401).send({ status: false, msg: "invalid password" });

  const token = jwt.sign(
    {
      userId: user._id,
    },
    "FunctionUp",
    {
      expiresIn: "300s",
    }
  );

  res.status(201).send({
    status: true,
    user: user._id,
    token: token,
  });
};

module.exports = { registration, userLogin };
