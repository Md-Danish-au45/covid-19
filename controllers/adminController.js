const adminModel = require("../models/adminModel")
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")
const moment = require("moment")
const slotModel = require("../models/slotModel")


const isInputDateValid =  date=> moment(date, 'DD-MM-YYYY',true).isValid()

const login = async(req,res)=>{
    try {
        const phoneNumber = req.body.phoneNumber
        const password = req.body.password
        const name = req.body.name

        console.log(phoneNumber)
        console.log(password)
        console.log(name)

        //phone Number valid or not
        const adminData = await adminModel.findOne({phoneNumber},{password},{name})

        // if adminData isnot there then show message:"provide valid mobile number"
        if(!phoneNumber)
        return res.status(400).send({
            status:"Failure",
            message:"Provide valid mobile Number"
        })

        if(!name)
        return res.status(400).send({
            status:"Failure",
            message:"Provide valid name"
        })

        // const token = jwt.sign({id:adminData,type:"admin"},"covid",{ expiresIn: '900d'})

        // res.header('x-api-key', token);
        res.status(200).send({ status: true, data: "User login successful" })


    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status:"Falure",
            message:"Internal Server Error"
        })
    }
}

const getUsers = async (req,res) => {
    try {
        //dose =3 => repersents both vaccination done
        const {age,pincode,dose} =req.query

        const conditions ={isDeleted:false}

        if(age)
        {
            conditions.age =age
        }
        if(pincode){
            conditions.pincode = pincode
        }
        if(dose==1)
        {
            conditions["doses.first.slotId"] = {$exists:true}
        }
        else if(dose==2){
            conditions["doses.second.slotId"] = {$exists:true}
        }
        else if(dose==3){
            conditions["doses.first.slotId"] = {$exists:true}
            conditions["doses.second.slotId"] = {$exists:true}
        }

        const users = await userModel.find(conditions)

        return res.status(200).send({
            status:"Success",
            data:users
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({status:"Falure",message:"Internal Server Error"})
    }
}

const getRegisteredSlots = async (req,res)=> {
    try {
         //dose =3 => repersents both vaccination done
        const {dose,date} = req.query
        const userData = await userModel.find({$or:[{"doses.first.slotId":{$exists:true}},{"doses.second.slotId":{$exists:true}}]})
     
        
        if(!(dose==1||dose==2||dose==3))
        return res.status(400).send({status:"Failure",message:"provide 1,2,3 as a value for dose field, 3 repersents for both vaccination done"})
      
        if(!isInputDateValid(date))
        return res.status(400).send({status:"Failure",message:"Enter valid date in DD-MM-YYYY format"})

        const slotSet = new Set()

        if(dose==1 || dose==3){
            userData.forEach((data)=> {
               if (data.doses?.first?.slotId){
                slotSet.add(data.doses.first.slotId.toString())
               }
            })
        }
        if(dose==2 || dose==3){
            userData.forEach((data)=> {
                if (data.doses?.second?.slotId){
                 slotSet.add(data.doses.second.slotId.toString())
                }
             })
        }
        console.log(date,moment(date).toDate())
        const slotIds = [...slotSet.values()]
        let registeredSlots = await slotModel.find({_id:{$in:slotIds},start:{$gte:moment(date).toDate()}})

        registeredSlots= registeredSlots.map(slot=> {
            return {
             id: slot._id,
             date: moment(slot.start).local().format("DD-MM-YYYY"),
             startAt:moment(slot.start).local().format("HH:mm"),
             endAt: moment(slot.end).local().format("HH:mm"),
             capacity:slot.capacity
         }
 
         })
        return res.send(registeredSlots)

    } catch (error) {
        console.log(error)
        return res.status(500).send({status:"Falure",message:"Internal Server Error"})
    }
}

module.exports = {
    login,
    getUsers,
    getRegisteredSlots
}