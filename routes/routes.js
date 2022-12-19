const express = require("express")
const router = express.Router()


const userController = require("../controllers/userController")
const slotController = require("../controllers/slotController")
const adminController = require("../controllers/adminController")
const auth = require("../middlewares/auth")
//user api

router.post("/users",userController.createUser)
router.post("/users/login",userController.login)
router.post("/users/:uId/slots/:sId",auth.isAuthenticated,userController.registerSlot)
router.put("/users/:uId/slots/:sId",auth.isAuthenticated,userController.updateRegisteredSlot)


//slot api
router.post("/slots",slotController.createSlots)
router.get("/slots",slotController.getSlots)

//admin api
router.post("/admins/login",adminController.login)
router.get("/admins/users",auth.isAuthenticated,auth.isAdmin,adminController.getUsers)
router.get("/admins/slots",auth.isAuthenticated,auth.isAdmin,adminController.getRegisteredSlots)


module.exports = router