const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId; 
const cartSchema = new mongoose.Schema({

userId:{
    type:objectId,
    ref :"User",
    required:true,
    unique:"true"
},

items:[{
    productId:{
        type:objectId,
        ref :"Product",
        requiored:true,
    },
    quantity:{
        type:number,
        required:true,
        minlen:1

    }

}],

totalPrice:{
    type:number,
    required:true
},

totalItems:{
    type:number,
    required:true
},

}, { timestamps: true })

module.exports = mongoose.model("Cart",cartSchema)

