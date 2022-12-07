const express = require("express")
const dotenv = require('dotenv')
const router = require("./routes/routes")
const app = express()
const {initDB} = require("./dbConfig")


dotenv.config({path:"./config.env"})
app.use(express.json())
app.use("/",router)

initDB()

const port = process.env.PORT || 5500
app.listen(port,(req, res) =>{
    console.log(`listening to port ${port}...`)
})