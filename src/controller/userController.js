const userModel = require("../models/userModel");
const {
  isValidRequest,
  isValidString,
  isValidName,
  isValidMail,
  isValidPhone,
  isValidPassword,
  hashPassword,
  isValidPincode,
  isValidId,
  isImageFile
} = require("../validator/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../AWS/awsConfig");

//>>>>>>>>>>>>>>>>>>>>>>>>>>Register User <<<<<<<<<<<<<<<<<<<<<<<<<<<<<//

const createUser = async function (req, res) {
  try {
    const data = req.body;

    // first Check request body is coming or not
    if (!isValidRequest(data)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide User details",
      });
      return;
    }

    // Object Destructing
    let { fname, lname, email, phone, password, address } = data;

    // Check Name is coming or not
    if (!isValidString(fname)) {
      res
        .status(400)
        .send({ status: false, message: "FirstName is mandatory" });
      return;
    }

    // Check Name is valid or not
    if (!isValidName(fname)) {
      res
        .status(400)
        .send({ status: false, message: "FirstName is not a valid name" });
      return;
    }

    let validString = /\d/;
    if (validString.test(fname))
      return res.status(400).send({
        status: false,
        msg: "FirstName must be valid it should not contains numbers",
      });

    // Check Last Name is coming or not
    if (!isValidString(lname)) {
      res.status(400).send({ status: false, message: "LastName is mandatory" });
      return;
    }

    // Check Name is valid or not
    if (!isValidName(lname)) {
      res
        .status(400)
        .send({ status: false, message: "LastName is not a valid name" });
      return;
    }

    if (validString.test(lname))
      return res.status(400).send({
        status: false,
        msg: "LastName must be valid it should not contains numbers",
      });

    // Extracting file from request's files and validating and uploading in aws-s3
    let files = req.files;
    if (!isValidString(files)) {
      res
        .status(400)
        .send({ status: false, message: "profile image files is mandatory" });
      return;
    }

    
    if (files && files.length > 0) {
      if (!isImageFile(files[0].originalname)) {
        return res
          .status(400)
          .send({ status: false, message: "File extension not supported!" });
      }
      let uploadedFileURL = await uploadFile(files[0]);
      data.profileImage = uploadedFileURL;
      //res.status(201).send({msg: 'file uploaded succesfully', data: uploadedFileURL})
    } else {
      return res.status(400).send({ status: false, message: "No file found" });
    }

    // Check Phone Number is coming or not
    if (!isValidString(phone)) {
      res
        .status(400)
        .send({ status: false, message: "Phone number is mandatory" });
      return;
    }

    // Validate the Phone Number
    if (!isValidPhone(phone)) {
      res
        .status(400)
        .send({ status: false, message: "Phone number is not a valid" });
      return;
    }

    // Check Duplicate Phone Number
    const isExistPhone = await userModel.findOne({ phone: phone });
    if (isExistPhone) {
      res.status(400).send({
        status: false,
        message: "This phone number belong to other user",
      });
      return;
    }

    // Check Email is Coming or not
    if (!isValidString(email)) {
      res.status(400).send({ status: false, message: "Email is required" });
      return;
    }

    // Validate Email
    if (!isValidMail(email)) {
      res.status(400).send({ status: false, message: "Email is invalid" });
      return;
    }

    // Check Duplicate Email
    const isExistEmail = await userModel.findOne({ email: email });
    if (isExistEmail) {
      res
        .status(400)
        .send({ status: false, message: "This Email belong to other user" });
      return;
    }

    // Check Password is Coming Or not
    if (!isValidString(password)) {
      res.status(400).send({ status: false, message: "password is required" });
      return;
    }

    // Validate Password
    if (!isValidPassword(password)) {
      res.status(400).send({
        status: false,
        message:
          "Password must be 8-15 characters long consisting of atleast one number, uppercase letter, lowercase letter and special character",
      });
      return;
    }

    const hashPass = await hashPassword(password);
    data.password = hashPass;

    //Check Address is Comming or not
    if (!address) {
      res.status(400).send({ status: false, message: "Address is required" });
      return;
    }
    //address = JSON.parse(address); //convert Json to String
    //const {shipping , billing } = address

    //Check Shipping is Comming or not
    if (!address.shipping) {
      res.status(400).send({ status: false, message: "Shipping is required" });
      return;
    }

    //Check Address Shipping Street is Comming or not
    if (!isValidString(address.shipping.street)) {
      res
        .status(400)
        .send({ status: false, message: "Shipping street is required" });
      return;
    }

    // Validate street
    if (!isValidName(address.shipping.street)) {
      res.status(400).send({ status: false, message: "Enter a valid Street" });
      return;
    }

    //Check Address Shipping City is  Comming or not
    if (!isValidString(address.shipping.city)) {
      res
        .status(400)
        .send({ status: false, message: "Shipping city is required" });
      return;
    }

    // Validate city
    if (!isValidName(address.shipping.city)) {
      res
        .status(400)
        .send({ status: false, message: "Enter a valid city name" });
      return;
    }

    //City should not contains  Number
    if (validString.test(address.shipping.city))
      return res.status(400).send({
        status: false,
        msg: "City name must be valid it should not contains numbers",
      });

    //Check Shipping pincode is Comming or not
    if (!isValidString(address.shipping.pincode)) {
      res
        .status(400)
        .send({ status: false, message: "Shipping pincode is required" });
      return;
    }

    // Validate pincode
    if (!isValidPincode(address.shipping.pincode)) {
      res.status(400).send({
        status: false,
        message: ` ${address.shipping.pincode}  is not valid city pincode`,
      });
      return;
    }

    //Check Billing is Comming or not
    if (!address.billing) {
      res.status(400).send({ status: false, message: "billing is required" });
      return;
    }

    //Check Billing Street is comming or not
    if (!isValidString(address.billing.street)) {
      res
        .status(400)
        .send({ status: false, message: "Billing street is required" });
      return;
    }

    // Validate street
    if (!isValidName(address.billing.street)) {
      res
        .status(400)
        .send({ status: false, message: "Enter a valid billing street" });
      return;
    }

    //Check Billing City is  comming or not
    if (!isValidString(address.billing.city)) {
      res
        .status(400)
        .send({ status: false, message: "billing city is required" });
      return;
    }

    // Validate city
    if (!isValidName(address.billing.city)) {
      res
        .status(400)
        .send({ status: false, message: "Enter a valid billing city name" });
      return;
    }

    //Check billing city Contain only Alphabet
    if (validString.test(address.billing.city))
      return res.status(400).send({
        status: false,
        msg: "billing city name must be valid it should not contains numbers",
      });

    //Check billing pincode is Comming or not
    if (!isValidString(address.billing.pincode)) {
      res
        .status(400)
        .send({ status: false, message: "billing pincode is required" });
      return;
    }

    // Validate pincode
    if (!isValidPincode(address.billing.pincode)) {
      res.status(400).send({
        status: false,
        message: ` ${billing.pincode}  is not valid billing city pincode`,
      });
      return;
    }

    //Object Destructing
    let finalData = {
      fname,
      lname,
      email,
      profileImage: data.profileImage,
      phone,
      password: hashPass,
      address,
    };

    // Finally Create The User Details After Validation
    let userData = await userModel.create(finalData);
    res.status(201).send({
      status: true,
      message: "User created successfully",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};

//>>>>>>>>>>>>>>>>>>>>>>>>>> Login User <<<<<<<<<<<<<<<<<<<<<<<<<<<<<//
const loginUser = async (req, res) => {
  try {
    let data = req.body;

    // first Check request body is coming or not
    if (!isValidRequest(data)) {
      res.status(400).send({
        status: false,
        Message: "Invalid request parameters. Please provide User details",
      });
      return;
    }

    const { email, password } = data;

    // Check Email is Coming Or not
    if (!isValidString(email)) {
      res.status(400).send({ status: false, message: "Email is required" });
      return;
    }

    // Validate Email
    if (!isValidMail(email)) {
      res.status(400).send({ status: false, message: "Email is invalid" });
      return;
    }

    // Check password is Coming Or not
    if (!isValidString(password)) {
      res.status(400).send({ status: false, message: "password is required" });
      return;
    }

    // Validate password
    if (!isValidPassword(password)) {
      res
        .status(400)
        .send({ status: false, message: "It is not valid password" });
      return;
    }

    // Check Email and password is Present in DB
    let user = await userModel.findOne({ email: email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({
        status: false,
        msg: "Email or password does not match, Invalid login Credentials",
      });
    }

    // Generate Token
    let token = jwt.sign(
      {
        userId: user._id.toString(),
        iat: new Date().getTime() / 1000,
      },
      "Project05Group59", //it is secret key
      { expiresIn: "24h" }
    );

    // send response to  user that Author is successfully logged in
    res.status(200).send({
      status: true,
      message: "User login successfully",
      data: { userId: user._id, token: token },
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//>>>>>>>>>>>>>>>>>>>>>>>>>>Get User Details <<<<<<<<<<<<<<<<<<<<<<<<<<<<<//
const getUserProfile = async function (req, res) {
  try {
    let userId = req.params.userId;

    // if userId is not a valid ObjectId
    if (!isValidId(userId)) {
      return res.status(400).send({
        status: false,
        message: "userId is invalid",
      });
    }

    // if user does not exist
    let userDoc = await userModel.findById(userId);
    if (!userDoc) {
      return res.status(400).send({
        status: false,
        message: "user does not exist",
      });
    }

    
    if (req.userId !== userId) {
      return res.status(400).send({
        status: false,
        message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`,
      });
    }

    res.status(200).send({
      status: true,
      message: "User profile details",
      data: userDoc,
    });
  } catch (err) {
    res.status(400).send({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//>>>>>>>>>>>>>>>>>>>>>>>>>> Update User Details <<<<<<<<<<<<<<<<<<<<<<<<<<<<<//
const updateUser = async function (req, res) {
  try {
    const userId = req.params.userId;
    let requestBody = { ...req.body }; // req.body does not have a prototype; creating a new object (prototype object associates by default)
    let files = req.files;

    // if userId is not a valid ObjectId
    if (!isValidId(userId)) {
      res
        .status(400)
        .send({ status: false, message: `${userId} is not a valid user id` });
      return;
    }

    // if req.body is empty
    if (!isValidRequest(requestBody)) {
      res.status(400).send({
        status: false,
        message:
          "Invalid request parameters. Please provide updating keys  details",
      });
      return;
    }

    // if user does not exist
    let userDoc = await userModel.findById(userId);
    if (!userDoc) {
      return res
        .status(404)
        .send({ status: false, msg: "user does not exist" });
    }

    
    if (req.userId !== userId) {
      return res.status(400).send({
        status: false,
        message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`,
      });
    }

    let { fname, lname, email, phone, password, address } = requestBody;
    const updateUserData = {};

    // fname check
    if (requestBody.hasOwnProperty("fname")) {
      if (!isValidName(fname)) {
        return res.status(400).send({
          status: false,
          message: "fname is invalid",
        });
      }
      updateUserData.fname = fname;
    }

    // lname check
    if (requestBody.hasOwnProperty("lname")) {
      if (!isValidName(lname)) {
        return res.status(400).send({
          status: false,
          message: "lname is invalid",
        });
      }
      updateUserData.lname = lname;
    }

    // email check
    if (requestBody.hasOwnProperty("email")) {
      if (!isValidMail(email)) {
        return res.status(400).send({
          status: false,
          message: "email is invalid",
        });
      }
      // email duplication check
      const emailDb = await userModel.findOne({ email: email });
      if (emailDb && emailDb._id.toString() !== userId)
        
        return res
          .status(400)
          .send({ status: false, msg: `${email} already used!` });
      updateUserData.email = email;
    }

    // phone check
    if (requestBody.hasOwnProperty("phone")) {
      if (!isValidPhone(phone)) {
        return res.status(400).send({
          status: false,
          message: "phone is invalid",
        });
      }
      // phone duplication check
      const phoneDb = await userModel.findOne({ phone: phone });
      if (phoneDb && phoneDb._id.toString() !== userId)
        return res
          .status(400)
          .send({ status: false, msg: `${phone} already used!` });
      updateUserData.phone = phone;
    }

    // password check
    if (requestBody.hasOwnProperty("password")) {
      if (!isValidPassword(password)) {
        return res.status(400).send({
          status: false,
          message: "password is invalid",
        });
      }
      const hashPass = await hashPassword(password);
      updateUserData.password = hashPass;
    }

    
    updateUserData.address = userDoc.address; // storing previous address in updateUserData

    // JSON.parse(undefined/emptyString) throws "Internal Server Error"
    if (isValidString(address)) {
      address = JSON.parse(address); // new address (if sent through req.body) manipulated to access values using dot notation
    }
    const validString = /\d/;

    // adding new shipping details
    if (address?.shipping) {
      const shipping = address.shipping; 

      if (shipping.hasOwnProperty("street")) {
        if (!isValidName(shipping.street)) {
          return res.status(400).send({
            status: false,
            message: "shipping address' street is invalid",
          });
        }
        updateUserData.address.shipping.street = shipping.street;
      }

      if (shipping.hasOwnProperty("city")) {
        // if city is invalid
        if (!isValidName(shipping.city) || validString.test(shipping.city)) {
          return res.status(400).send({
            status: false,
            message: "shipping address' city name is invalid",
          });
        }
        updateUserData.address.shipping.city = shipping.city;
      }

      if (shipping.hasOwnProperty("pincode")) {
        // if pincode is invalid
        if (!isValidPincode(shipping.pincode)) {
          return res.status(400).send({
            status: false,
            message: "shipping address' pincode is invalid",
          });
        }
        updateUserData.address.shipping.pincode = shipping.pincode;
      }
    }

    // adding new billing details
    if (address?.billing) {
      const billing = address.billing; 

      if (billing.hasOwnProperty("street")) {
        // if street is invalid
        if (!isValidName(billing.street)) {
          return res.status(400).send({
            status: false,
            message: "billing address' street is invalid",
          });
        }
        updateUserData.address.billing.street = billing.street;
      }

      if (billing.hasOwnProperty("city")) {
        // if city is invalid
        if (!isValidName(billing.city) || validString.test(billing.city)) {
          return res.status(400).send({
            status: false,
            message: "billing address' city is invalid",
          });
        }
        updateUserData.address.billing.city = billing.city;
      }

      if (billing.hasOwnProperty("pincode")) {
        // if pincode is invalid
        if (!isValidPincode(billing.pincode)) {
          return res.status(400).send({
            status: false,
            message: "billing address' pincode is invalid",
          });
        }
        updateUserData.address.billing.pincode = billing.pincode;
      }
    }

   
    // updating image
    if (files.length) {
      if (!isImageFile(files[0].originalname)) {
        return res
          .status(400)
          .send({ status: false, message: "File extension not supported!" });
      }
      let uploadedFileURL = await uploadFile(files[0]);
      updateUserData.profileImage = uploadedFileURL;
    }

    let updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      updateUserData,
      { new: true }
    );

    res.status(200).send({
      status: true,
      message: "User profile updated",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


module.exports = { createUser, loginUser, getUserProfile, updateUser };