const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    
    password:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},
{
    timestamps:true
})


module.exports = mongoose.model("Admin",adminSchema)



