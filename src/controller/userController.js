const userModel = require("../models/userModel");
const {
  isValidRequest,
  isValidString,
  isValidName,
  isValidMail,
  isValidPhone,
  isValidPassword,
  isValidPincode,
  isValidId,
  isImageFile
} = require("../validator/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../AWS/awsConfig");
const mongoose = require("mongoose");

const createUser = async function (req, res) {
  try {
    // if (!isValidRequest(req.body)) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Enter valid Input" });
    // }
    let { fname, lname, email, phone, password, address } = req.body;

    let userData = {};
    
    let profileImage = req.files;
    console.log(fname)
    if (!fname) {
      return res
        .status(400)
        .send({ status: false, message: "First Name is required" });
    }
    fname = fname.trim();
    if (!isValidString(fname) || !isValidName(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter first name in proper format" });
    }
    userData.fname = fname;

    if (!lname) {
      return res
        .status(400)
        .send({ status: false, message: "Last Name is required" });
    }
    console.log(lname)
    lname = lname.trim();
    if (!isValidString(lname) || !isValidName(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter Last name in proper format" });
    }
    userData.lname = lname;

    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "Email is required" });
    }
    console.log(email)
    email = email.trim();
    if (!isValidString(email) || !isValidMail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter email in proper format" });
    }
    const isDuplicateEmail = await userModel.findOne({ email });
    if (isDuplicateEmail) {
      return res
        .status(409)
        .send({ status: false, message: `${email} emailId already in use` });
    }
    userData.email = email;

    //Profile Image validation
    if (profileImage.length > 0) {
      console.log(profileImage[0]);
      let match = /\.(jpeg|png|jpg)$/.test(profileImage[0].originalname);
      if (match == false) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Profile Image is required in JPEG/PNG/JPG format",
          });
      }
      let uploadedFileURL = await uploadFile(profileImage[0]);
      console.log(uploadedFileURL);
      userData.profileImage = uploadedFileURL;
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Profile Image is required" });
    }

    //Phone number validation
    if (!phone) {
      return res
        .status(400)
        .send({ status: false, message: "Phone number is required" });
    }
    if (!isValidString(phone) || !isValidPhone(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter phone in valid format" });
    }
    let userPhone = await userModel.find();
    phone = phone.toString();

    //incase phone number is starting from +91 in body
    if (phone.startsWith("+91", 0) == true) {
      let newPhone = phone.substring(4, 14);
      for (i = 0; i < userPhone.length; i++) {
        if (userPhone[i].phone.startsWith("+91")) {
          if (userPhone[i].phone.startsWith(newPhone, 4) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(0)) {
          if (userPhone[i].phone.startsWith(newPhone, 1) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(newPhone, 0) == true) {
          return res
            .status(409)
            .send({
              status: false,
              message: `${phone} phone number is already in use`,
            });
        }
      }
      userData.phone = phone;
    }

    //incase phone number is starting from 0 in body
    if (phone.startsWith("0", 0) == true) {
      for (i = 0; i < userPhone.length; i++) {
        newPhone = phone.substring(1, 12);
        if (userPhone[i].phone.startsWith("+91")) {
          if (userPhone[i].phone.startsWith(newPhone, 4) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(0)) {
          if (userPhone[i].phone.startsWith(newPhone, 1) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(newPhone, 0) == true) {
          return res
            .status(409)
            .send({
              status: false,
              message: `${phone} phone number is already in use`,
            });
        }
      }
      userData.phone = phone;
    }

    //incase there is just the phone number without prefix
    if (phone) {
      for (i = 0; i < userPhone.length; i++) {
        if (userPhone[i].phone.startsWith("+91")) {
          if (userPhone[i].phone.startsWith(phone, 4) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(0)) {
          if (userPhone[i].phone.startsWith(phone, 1) == true) {
            return res
              .status(409)
              .send({
                status: false,
                message: `${phone} phone number is already in use`,
              });
          }
        }

        if (userPhone[i].phone.startsWith(phone, 0) == true) {
          return res
            .status(409)
            .send({
              status: false,
              message: `${phone} phone number is already in use`,
            });
        }
      }
      userData.phone = phone;
    }

    //Password validation
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });
    }
    if (!isValidString(password) || !isValidPassword(password)) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "Password should contain min 8 and max 15 character with a number and a special character",
        });
    }

    //Encrypting password
    const encryptPassword = await bcrypt.hash(password, 10);
    console.log(encryptPassword);
    userData.password = encryptPassword;

    //Address validation
    //let Address = JSON.parse(req.body.address)
    if (!address) {
      return res
        .status(400)
        .send({ status: false, message: "address is required" });
    }
    if (!isValidRequest(address)) {
      return res
        .status(400)
        .send({ status: false, message: "Address should include fields" });
    }
  
    let { shipping, billing } = address;
    // shipping validation
    if (!isValidRequest(shipping)) {
      return res
        .status(400)
        .send({ status: false, message: "Shipping address is required" });
    }
    //Street validation
    if (!isValidString(shipping.street)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Enter valid Street, street is required",
        });
    }
    // //City validation
    if (!isValidString(shipping.city)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter valid City, city is required" });
    }
    //Pincode validation
    if (!isValidPincode(shipping.pincode)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Enter valid Pincode, pincode is required",
        });
    }

    //Billing Validation
    if (!isValidRequest(billing)) {
      return res
        .status(400)
        .send({ status: false, message: "Billing address is required" });
    }
    //Street validation
    if (!isValidString(billing.street)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Enter valid Street, street is required",
        });
    }
    //City validation
    if (!isValidString(billing.city)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter valid City, city is required" });
    }
    //Pincode validation
    if (!isValidPincode(billing.pincode)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Enter valid Pincode, pincode is required",
        });
    }

    userData.address = address;
    const user = await userModel.create(userData);
    return res
      .status(201)
      .send({ status: true, message: "User created successfully", data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const loginUser = async function (req, res) {
  try {
    if (!isValidRequest(req.body)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide login details" });
    }
    let { email, password } = req.body;

    // validating the email
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }
    if (!isValidMail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Entered mail ID is not valid" });
    }

    // validating the password
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }
    if (!isValidPassword(password))
      return res
        .status(400)
        .send({ status: false, message: "Entered Passwrod is not valid" });

    let user = await userModel.findOne({
      email: email,
    });

    if (!user)
      return res.status(400).send({
        status: false,
        message: "Email does not exist",
      });
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .send({ status: false, message: "Entered Passwrod is incorrect" });
    }

    // JWT creation
    let token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      "productManagement/13/dfis",
      { expiresIn: "24h" }
    );
    res.header("x-api-key", token);
    return res
      .status(200)
      .send({
        status: true,
        message: "User login successfull",
        data: { userId: user._id, token: token },
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

//  <============================GET USER ===================================>

const getUserProfile = async function(req, res){
  try {
      const userId = req.params.userId
      const userIdFromToken = req.userId

      //validation starts
      if (!isValidId(userId)) {
          return res.status(400).send({ status: false, message: "Invalid userId in params." })
      }
      //validation ends

      const findUserProfile = await userModel.findOne({ _id: userId })
      if (!findUserProfile) {
          return res.status(400).send({status: false, message: `User doesn't exists by `})
      }
      res.status(200).send({status: true, message: "User profile details", data: findUserProfile})

  
  } catch (err) {
      return res.status(500).send({status: false, message: "Error is: " + err.message})}
}





//<============================================Update API =============================>

const updateUser = async function (req, res) {
  try {
    const userId = req.params.userId;
    let requestBody = { ...req.body }; // req.body does not have a prototype; creating a new object (prototype object associates by default)
    let files = req.files;

    // if userId is not a valid ObjectId
    if (!isValidId(userId)) {
      res
        .status(400)
        .send({ status: false, message: `${userId} is not a valid author id` });
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

    // AUTHORISATION
    // if (req.userId !== userId) {
    //   return res.status(400).send({
    //     status: false,
    //     message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`,
    //   });
    // }

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
        // 2nd part added to exclude "self(user)" email's duplication check
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
        // 2nd part added  to exclude "self(user)" phone's duplication check
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
      const hashPass = await bcrypt.hash(password, 10);
      updateUserData.password = hashPass;
    }

    // Updating address 
    updateUserData.address = userDoc.address; // storing previous address in updateUserData

    // JSON.parse(undefined/emptyString) throws "Internal Server Error"
    if (isValidString(address)) {
      address = JSON.parse(address); // new address (if sent through req.body) manipulated to access values using dot notation
    }
    const validString = /\d/;

    // adding new shipping details
    if (address?.shipping) {
      const shipping = address.shipping; // declaration

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
      const billing = address.billing; //  declaration

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
      message: "user profile updated",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createUser , loginUser, getUserProfile, updateUser};
