const mongoose = require('mongoose')

const isBodyEmpty = function(data)
{
    if(Object.keys(data).length==0) return false  
    return true 
}

const isValid = function(value)
{
    if(typeof value === 'undefined' || typeof value === null ) return false
    if(typeof value ==='string' && value.trim().length === 0) return false // name: ""
    return true
}

// pincode validation
const isValidPincode = function (pincode) {
    const pattern = /^[1-9]{1}[0-9]{2}\s?[0-9]{3}$/;
    return pattern.test(pincode); // returns a boolean
  };

const isValidOjectId = function(id)
{
    if(mongoose.Types.ObjectId.isValid(id)) return true;
    return false;
}


const validateEmail = function (mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }
};

const regex = /[`/\d/!@#$%^&*()_+\=\[\]{};':"\\|.<>\/?~]/
const isVerifyString = function (string) {
    return regex.test(string)
};

const regEx=/^[6-9]\d{9}$/
const isValidMobileNo = function(mobno)
{
    return regEx.test(mobno)
}




module.exports={ isBodyEmpty, isValid,validateEmail,isValidMobileNo, isVerifyString, isValidOjectId,checkISBN,isValidPincode,isValidRelAt, checkRating}