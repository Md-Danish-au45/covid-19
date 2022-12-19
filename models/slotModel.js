const mongoose = require("mongoose")

const slotSchema = mongoose.Schema({
    start:{
         type:Date,
         required:true
        },
    end: {
         type:Date,
         required:true
        },
    capacity: { 
        type:Number,
        required:true
    }
},{timestamps:true})


module.exports = mongoose.model("Slot",slotSchema)