const slotModel = require("../models/slotModel")
const moment = require("moment")

const isInputDateValid =  date=> moment(date, 'DD-MM-YYYY',true).isValid()
const isInputTimeValid =  time=> moment(time, 'HH:mm',true).isValid()

const createSlots = async (req,res)=> {
    try {
       let {startDate,endDate,startTime,endTime,capacity,duration}= req.body 

       if(capacity==null || capacity==undefined || duration ==null || duration==undefined)
       return res.status(400).send({status:"Failure",message:"capacity & duration is required field"})

       if(typeof capacity!="number" || typeof duration!="number" || !capacity.toString().match(/^\d+$/) || !duration.toString().match(/^\d+$/) || duration<0 || duration>60  ) 
       return res.status(400).send({status:"Failure",message:"capacity and duration should have a number as a value"})
       

        if(!isInputDateValid(startDate))
        return res.status(400).send({status:"Failure",message:"Enter valid startDate in DD-MM-YYYY format"})

        if(!isInputDateValid(endDate))
        return res.status(400).send({status:"Failure",message:"Enter valid endDate in DD-MM-YYYY format"})

        if(!isInputTimeValid(startTime))
        return res.status(400).send({status:"Failure",message:"Enter valid startTime in HH:MM 24 hour format"})

        if(!isInputTimeValid(endTime))
        return res.status(400).send({status:"Failure",message:"Enter valid endTime in HH:MM 24 hour format"})

        if(moment(endTime, ['HH:mm']).format('HH:mm') <= moment(startTime, ['HH:mm']).format('HH:mm')){
            return res.status(400).send({status:"Failure",message:"Start Time should be greater than end time"})
        }

        const slotData =[]
        let tempStartTime = startTime,tempEndTime =endTime
        while (moment(startDate, ['DD-MM-YYYY']) <= moment(endDate, ['DD-MM-YYYY'])) {
        
            const slotEndTime = moment(tempStartTime, ['HH:mm']).add(duration, 'm').format('HH:mm');

          if(moment(slotEndTime, ['HH:mm']).format('HH:mm')> moment(endTime, ['HH:mm']).format('HH:mm'))  {
            startDate =moment(startDate, "DD-MM-YYYY").add(1, 'days').format("DD-MM-YYYY")
            tempStartTime=startTime
            continue;
          }
          

          slotData.push({
            start:moment(startDate,"DD-MM-YYYY").add( moment.duration(tempStartTime)).toDate(),
            end:moment(startDate,"DD-MM-YYYY").add( moment.duration(slotEndTime)).toDate(),
            capacity
          })

        //   console.log("startDate===>",startDate,"startTime===>",tempStartTime," slotEndTime===> ",slotEndTime," endDate===>",endDate)

          tempStartTime =slotEndTime

        }

        const savedData = await slotModel.insertMany(slotData)

        return res.status(201).send({status:"Success",data:savedData})  

    } catch (error) {
        
    }
}

const getSlots = async (req,res)=> {
    try {
        
        let availableSlots = await slotModel.find({capacity:{$gt:0}}).select({start:1,end:1,capacity:1}).lean()

       availableSlots= availableSlots.map(slot=> {
           return {
            id: slot._id,
            date: moment(slot.start).local().format("DD-MM-YYYY"),
            startAt:moment(slot.start).local().format("HH:mm"),
            endAt: moment(slot.end).local().format("HH:mm"),
            capacity:slot.capacity
        }

        })

        return res.status(200).send({status:"Success",data:availableSlots})

    } catch (error) {
        
    }
}

module.exports = {createSlots,getSlots}