const mongoose = require("mongoose")
const { init } = require("./models/userModel")

async function  initDB(){
    await mongoose.connect(process.env.DATABASE)
    try{
        console.log("database is connected successfully.")

    }catch(err){
        console.log("error in db!!!.........")

    }

}

module.exports = {
    initDB
}