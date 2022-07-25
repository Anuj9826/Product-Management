const mongoose = require("mongoose")

let UserSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: true,  
    },
    lname:{
        type: String,
        required: true, 
    },
    email:{
        type: String,
        required: true, 
        unique: true
    },
    profileImage:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true, 
        unique: true
    },
    password:{
        type: String,
        required: true, 
        min: 8,
        max: 15
    },
    address:{
        street:{
            type: String,
            required: true,
        },
        city:{
            type: String,
            required: true,
        },
        pincode:{
            type: Number,
            required: true,
        }
    },
    billing:{
        street:{
            type: String,
            required: true,
        },
        city:{
            type: String,
            required: true,
        },
        pincode:{
            type: Number,
            required: true,
        }
    }
}, {timestamps: true})

module.exports = mongoose.model('User', UserSchema)