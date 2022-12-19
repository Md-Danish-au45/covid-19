const express = require("express")
const dotenv = require('dotenv')
const router = require("./routes/routes")
const app = express()
const {initDB} = require("./dbConfig")
const mongoose = require('mongoose');

// set  mongoose strictquery is true if i am not set the strictQuery true then it will show deprecated---trace
mongoose.set('strictQuery', true);

// configure the dotenv File
dotenv.config({path:"./config.env"})

// middleware
app.use(express.json())
app.use("/",router)

// database
initDB()

const port = process.env.PORT || 3500
app.listen(port,() =>{
    console.log(`listening to port ${port}...`)
})