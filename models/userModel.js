const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true},
        
    pincode:{
        type:String,
        required:true
    },
    aadhaarNo:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    doses:{
        first:{
            slotId:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"slots"
            }
        },
        second:{
            slotId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"slots"
            }
        }
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true})




module.exports = mongoose.model("cowinUser",userSchema)