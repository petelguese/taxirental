let express = require("express");
let router = express.Router();
let customerModel = require('../models/customerModel');
let carModel = require('../models/carModel');
let mongoose = require('mongoose')
let util = require('util')
//Booking
router.post('/bookCar',(req,res)=>{
    if(!req.body)
    {
        return res.status(400).send('request body is missing')
    }
    let data = req.body
    let carType = data.carType
    let customerId
    carModel.findOne({model:carType.model, seatingCapacity:carType.seatingCapacity, rentPerDay:carType.rentPerDay,bookingStatus:"no"})
    .then(result=>{
        let vehicleNumber = result.vehicleNumber
        let bookingList = new customerModel(data)
        bookingList.save()
        .then(doc=>{
            console.log(doc.id)
            carModel.findOneAndUpdate({vehicleNumber:vehicleNumber},{bookingStatus:"yes",$addToSet:{customerId:doc.id}},{new:true})
            .then(result=>{
                return res.status(200).send(result)
            })
            .catch(err=>{
                return res.status(500).send("error in updating")
            })
        })
        .catch(err=>{
            return res.status(500).send("cannot save data")
        })
    })
    .catch(err=>{
        checkAvailability(data.issueDate, data.returnDate, function(err, result){
            if(err)
            {
                console.error(err)
                return res.status(500).send("error in fetching booked list")
            }
            else{
                let bookingList = new customerModel(data)
                bookingList.save()
                .then(doc=>{
                    carModel.findOneAndUpdate({vehicleNumber:result[0].vehicleNumber},{$addToSet:{customerId:doc.id}},{new:true})
                    .then(result=>{
                        console.log(result)
                        return res.status(200).send(`Booked vehicle-${result.vehicleNumber}`)
                    })
                    .catch(err=>{
                        return res.status(500).send("error in finding vehicle")
                    })
                })
                .catch(err=>{
                    return res.status(500).send("There are no available cars to book")
                })
            }
        })
    })
})
//add new car
router.post('/addCar',(req,res)=>{
    if(!req.body)
    {
        return res.status(400).send('request body is missing')
    }
    let data = req.body
    data = {...data,bookingStatus:"no"}
    console.log("data---",data)
    let schema = new carModel(data)
    schema.save()
        .then(result=>{
            if(!result || result.length === 0)
            {
                return res.status(500).send(result)
            }
            console.log('success',result)
            return res.status(200).send(result);
        })
        .catch(err=>{
            return res.status(500).json(err)
        })
})

//Delete
router.delete('/deleteCar',(req,res)=>{
    if(!req.body)
    {
        return res.status(500).send("request body is missing")
    }
    let data = req.body
    carModel.findOneAndRemove({vehicleNumber:data.vehicleNumber,bookingStatus:"no"})
    .then(result=>{
        console.log(result)
        if(result == null)
        {
            return res.status(404).send("cannot perform delete operation- car is already booked or not available")
        }
        else{
            return res.status(200).send(result)
        }
    })
    .catch(err=>{
        return res.status(500).send(err)
    })
})
//Car details
router.get('/getAvailableCars',(req,res)=>{
    let data = req.body
    let total_cars=[]
    if(!data)
    {
        return res.status(404).send("request body missing")
    }
    let startDate = new Date(data.issueDate)
    let endDate = new Date(data.returnDate)
    carModel.find({bookingStatus:"no"})
    .then(result=>{
        if(result.length>0){total_cars.push(result)}
        console.log(result)
    })
    carModel.find({bookingStatus:"yes"})
    .then(result=>{
        if (result!=null)
        {
            checkAvailability(startDate,endDate,function(err, result){
                if(err){
                    return res.status(500).send("something went wrong")
                }
                else{
                    console.log(result)
                    total_cars.push(result)
                    if(result.length>0)
                    return res.status(200).send(total_cars)
                    else{
                        return res.status(200).send("no cars availabe on this date")
                    }
                }
            })
        }
    })
    .catch(err=>{
        return res.status(500).send(err)
    })
})


function checkAvailability(startDate, endDate, callback){
    carModel.find({bookingStatus:"yes"})
    .then(async result=>{
        let f_result= [];
        for (i in result)
        {
            var temp = 0
            cust = result[i].customerId
            console.log(cust," ",cust.length)
            for(x in cust)
            {
                temp = 0
                await customerModel.find({_id:cust[x],$or: [{returnDate: {$gt:startDate}},{startDate: {$lt:endDate}}]})
                .then(result1=>{
                    if(result1.length>0)
                    temp = 1
                    console.log("result1 ",result1)
                })
                .catch(err=>{
                    console.log("error1")
                    callback(err, null)
                    return;
                })
                if(temp==1)
                continue;
            }
            console.log("temp---",temp)
            if(temp == 0) 
            {
                console.log("inside")
                f_result.push(result[i])
            }
            console.log("f_result",f_result)
        }
        callback(null,f_result)
    })
    .catch(err=>{
        console.log("error2")
        callback(err, null)
        return;
    })
}
module.exports = router