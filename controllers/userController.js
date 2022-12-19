const userModel = require("../models/userModel")
const slotModel = require("../models/slotModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const createUser = async (req,res)=> {
    try {
        const {name,phoneNumber,age,pincode,aadhaarNo,password}= req.body
        const saltRounds=10;

        if(!name || typeof name!="string")
        return res.status(400).send({
            status:"Failure",
            message:"name is requried Fied & should have a string value"
        })

        if(!phoneNumber || typeof phoneNumber!="string")
        return res.status(400).send({
            status:"Failure",
            message:"phoneNumber is requried Fied  & should have a string value"
        })

        
        if(!age || typeof age!= "number")
        return res.status(400).send({
            status:"Failure",
            message:"age is requried Fied  & should have a number value"
        })

        if(!pincode || typeof pincode !="string")
        return res.status(400).send({
            status:"Failure",
            message:"pincode is requried Fied  & should have a string value"
        })

        if(!aadhaarNo || typeof aadhaarNo !="string")
        return res.status(400).send({
            status:"Failure",
            message:"aadhaarNo is requried Fied  & should have a string value"
        })

        if(!password || typeof password!="string")
        return res.status(400).send({status:"Failure",message:"password is requried Fied  & should have a string value"})


        const userData = await userModel.findOne({phoneNumber,isDeleted:false}).lean()
     
        if(!userData)
        return res.status(400).send({
                                status:"Failure",
                                message:"Please provide another phoneNumber"
                            })


        const encryptedPassword = await bcrypt.hash(password,saltRounds);
        console.log(encryptedPassword)
        const savedData = await userModel.create({name,phoneNumber,age,pincode,aadhaarNo,password})
        return res.status(201).send({status:"Success",data:savedData})

    } catch (error) {
        console.log(error)
        return res.status(500).send({status:"Falure",message:"Internal Server Error"})
    }
}

const login = async(req,res)=>{
    try {
        const {phoneNumber,password} = req.body
        console.log(phoneNumber)

        //phone Number valid or not
        const userData = await userModel.findOne({phoneNumber},{password})

        // if phoneNumber is not there 
        if(!phoneNumber)
        return res.status(400).send({
            status:"Failure",
            message:"Provide valid Phone Number",
            data:userData
        })

        console.log(password)
        const decryptPassword = await bcrypt.compare(password,userData.password)

        // if decryptPassword is not there
        if(!decryptPassword)
        return res.status(400).send({
            status:"Failure",
            message:"Provide valid password",
            data:decryptPassword   
        })

        const token = jwt.sign({id:userData._id,type:"user"},"covid",{ expiresIn: '90m'})
        console.log(token)

        res.header('x-api-key', token);
        res.status(200).send({
             status: true,
             data: "User login successful" 
            })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status:"Falure",
            message:"Internal Server Error"
        })
    }
}


// registeration of slot
const registerSlot = async (req,res)=> {
    try {
        const userId = req.params.uId
        const slotId = req.params.sId
        const {dose}= req.body
        let isAlreadyRegistered;

        if(req.userId!=userId)
        {return res.status(403).send({
            status:"Failure",
            message:"You'r unauthorised for this operation"
        })}

        const userData = await userModel.findOne({_id:userId,isDeleted:false}).lean()

        let toUpdate;
        
        if(dose==1 ){
            if( userData.doses?.first?.slotId){
                isAlreadyRegistered=true
            }  
            toUpdate={"doses.first.slotId":slotId}
        }
        else if(dose==2  ){
            if(userData.doses?.second?.slotId){
                isAlreadyRegistered =true
            }  
            toUpdate={"doses.second.slotId":slotId}
            if( !userData.doses?.first?.slotId){
                return res.status(400).send({
                    status:"Success",
                    message:"Register for first Dose"
                })
            } 
            const firstSlotData = await slotModel.findOne({_id:userData.doses.first.slotId}).select({start:1,end:1}).lean()
            const slotData = await slotModel.findOne({_id:slotId}).select({start:1}).lean()
           
            if(firstSlotData.end.getTime()>slotData.start.getTime())
            {
                return res.status(400).send({
                    status:"Success",
                    message:"First Dose is not Done"
                })
            }
        }
        else
        return res.status(400).send({
            status:"Failure",
            message: "dose should have 1 or 2 as a value"
        })

        if(isAlreadyRegistered)
        return res.status(400).send({
            status:"Failure",
            message:"Provided user is already registerd a slot"
        })


        const slotData = await slotModel.findOneAndUpdate({_id:slotId,capacity:{$gt:0}},{$inc:{capacity:-1}}).lean()


        // if slotData is not there
        if(!slotData)
        return res.status(400).send({
            status:"Failure",
            message:"Provided Slot is either full or invalid"
        })



        const updatedData = await userModel.findOneAndUpdate({_id:userId},toUpdate)
        
        res.status(200).send({
            status:"Success",
            data:"Provided slot registered"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status:"Falure",
            message:"Internal Server Error"
        })
    }
}

// updating registeredSlot 
const updateRegisteredSlot = async (req,res) => {
    try {
        const userId = req.params.uId
        const slotId = req.params.sId
        const {dose}= req.body
        let isAlreadyRegistered=true,same;

        if(req.userId!=userId)
        {return res.status(403).send({
            status:"Failure",
            message:"You'r unauthorised for this operation"
        })}
        

        const userData = await userModel.findOne({_id:userId,isDeleted:false}).lean()
        let toUpdate,findQuery,updateAllowed=true;

        let slotData = await slotModel.findOne({_id:slotId,capacity:{$gt:0}}).select({start:1}).lean()
        if(!slotData)
        return res.status(400).send({status:"Failure",message:"Provided Slot is either full or invalid"})

        

        if(dose==1 ){
            if( !userData.doses?.first?.slotId){
                isAlreadyRegistered=false
            }  

            else 
            { 
                if(slotId==userData.doses.first.slotId){
                    same=true
                }
                const firstSlotData = await slotModel.findOne({_id:userData.doses.first.slotId}).select({start:1,end:1}).lean()
                if(firstSlotData.start.getTime()-Date.now()> 24*60*60*1000){
                    updateAllowed=false
                }
                findQuery= {_id:userData.doses.first.slotId} 
                toUpdate={"doses.first.slotId":slotId} 
            }
            
            
            
        }
        else if(dose==2  ){
            if(!userData.doses?.second?.slotId || !userData.doses?.first?.slotId){
                isAlreadyRegistered =false
            }  
            else 
            {
                if(slotId==userData.doses.second.slotId)
                {same=true}
                toUpdate={"doses.second.slotId":slotId}
                findQuery= {_id:"doses.second.slotId"}

                const firstSlotData = await slotModel.findOne({_id:userData.doses.first.slotId}).select({start:1,end:1}).lean()
               
               
                if(firstSlotData.end.getTime()>slotData.start.getTime())
                {
                    return res.status(400).send({status:"Success",message:"First Dose is not Done"})
                }

                const secondSlotData = await slotModel.findOne({_id:userData.doses.first.slotId}).select({start:1,end:1}).lean()
                if(secondSlotData.start.getTime()-Date.now()> 24*60*60*1000){
                    updateAllowed=false
                }
            }    
        }
        else
        return res.status(400).send({
            status:"Failure",
            message: "dose should have 1 or 2 as a value"
        })

        // if isAlreadyRegistered is not there then show "message"
        if(!isAlreadyRegistered)
        return res.status(400).send({
            status:"Failure",
            message:"Provided user does not registerd any slot"
        })


        // if updateAllowed is not there
        if(!updateAllowed)
        return res.status(400).send({
            status:"Failure",
            message:"Provided user can't change his/her slot"
        })

        // if same is there 
        if(same)
        return res.status(400).send({
            status:"Failure",
            message:"Provided user already registered for provided slot"
        })

        slotData = await slotModel.findOneAndUpdate({_id:slotId,capacity:{$gt:0}},{$inc:{capacity:-1}}).lean();
        const updatePreviousSlot = await slotModel.updateOne(findQuery,{$inc:{capacity:1}})
        

        const updatedData = await userModel.findOneAndUpdate({_id:userId,isDeleted:false},toUpdate)
        
        res.status(200).send({
            status:"Success",
            data:"Provided slot registered"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status:"Falure",
            message:"Internal Server Error"
        })
    }
}


// exporting 

module.exports = {
    createUser,
    login,
    registerSlot,
    updateRegisteredSlot
}