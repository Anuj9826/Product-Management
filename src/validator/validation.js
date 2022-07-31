const mongoose = require('mongoose')

//validation for empty request body
const isValidRequest = function(data){
    if(Object.keys(data).length == 0){
        return false
    }
    return true
  }

const isValidString = function (value) {
    if (typeof value == undefined || value == null) return false;
    if (typeof value == "string" && value.trim().length == 0) return false;
    return true;
}

const isValidName = function(name){
    return /^[a-zA-Z ,]+.*$/.test(name)
} 

// function for email verification
const isValidMail = function (email) {
    return /^([0-9a-z]([-_\\.]*[0-9a-z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(email);
};

//function for verifying mobile number
const isValidPhone = function(phone){
    return  /^((\+91(-| )+)|0)?[6-9][0-9]{9}$/.test(phone); 
  };

// function for password verification
const isValidPassword = function (pass) {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(pass);
  };

 //function for pincode verification
 const isValidPincode = function(pin){
    return /^[1-9][0-9]{5}$/.test(pin)
};

const isValidId = function(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
     return false
    }return true
 }

const isImageFile = function(files){
    let imageRegex = /.*\.(jpeg|jpg|png)$/;
    return imageRegex.test(files)
}

const isValidPrice = function (value) {
    if (/^\d+(\.\d{1,2})?$/.test(value)) return true;
    return false;
  };

  const isValidBoolean = function (value) {
    return value === "true" || value === "false";
  };

  const isValidNum = function (value) {
    if (!/^[0-9]+$/.test(value)) {
      return false;
    }
    return true;
  };


module.exports = {  isValidRequest,
                    isValidString,
                    isValidName,
                    isValidMail,
                    isValidPhone,
                    isValidPassword,
                    isValidPincode,
                    isValidId,
                    isImageFile,
                    isValidPrice,
                    isValidBoolean,
                    isValidNum}