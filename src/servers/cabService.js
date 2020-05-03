let express = require("express");
let router = express.Router();
let customerModel = require('../models/customerModel');
let carModel = require('../models/carModel');
let mongoose = require('mongoose')
//Booking
router.post('/bookCar',(req,res)=>{
    if(!req.body)
    {
        return res.status(400).send('request body is missing')
    }
    let data = req.body
    let bookingList = new customerModel(data)
    bookingList.save()
        .then(result=>{
            let customerId = result.id
            console.log("customer----id",result)
            //return res.status(200).send(result)
            if(result)
            {
                carModel.findOneAndUpdate({seatingCapacity:result.carType.seatingCapacity,model:result.carType.model,
                    rentPerDay:result.carType.rentPerDay,bookingStatus:"no"},{bookingStatus:"yes",$addToSet:{customerId:customerId}},
                    {new:true})
                    .then(result=>{
                        return res.status(200).send(result)
                    })
                    .catch(err=>{
                        return res.status(500).send(err)
                    })
            }

            // addId(result.id, data.carType, data.issueDate, function(err,result){
            //     if(err)
            //     {
            //         return res.status(500).json(err)
            //     }
            //     else
            //     {
            //         console.log("id updated successfully")
            //         return res.status(200).send(result)
            //     }
            // })
        })
        .catch(err=>{
           return res.status(500).json(err)
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
        total_cars.push(result)
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
                    return res.status(200).send(total_cars)
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
    .then(result=>{
        console.log(result[0].customerId[0]," ",result[0].customerId[1])
        temp =0
        let f_result= [];
        for (i in result)
        {
            cust = result[i].customerId
            console.log(cust," ",cust.length)
            for(x in cust)
            {
                customerModel.find({_id:cust[x],returnDate:{$gt:startDate}})
                .then(result1=>{
                    console.log("result1 ",result1)
                })
                .catch(err=>{
                    console.log("error1")
                    callback(err, null)
                    return;
                })
            }
            f_result.push(result[i])
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

//adding customers
function addId(customerId, carType, issueDate, callback){
    var date = new Date(issueDate)
    console.log("inside addId", carType)
    carModel.find({seatingCapacity:carType.seatingCapacity,model:carType.model,
        rentPerDay:carType.rentPerDay,bookingStatus:"yes"})
    .then(result=>{
    let f_result = []
    console.log("BookedResult",result.length)
    for (_id in result)
    {
        console.log("_id", result[_id].customerId)
        let id = result[_id].customerId
        customerModel.find({_id:id})
        .then(result1=>{
            for (i in result1)
            {
                if(result1[i].returnDate.getTime()<date.getTime())
                {
                    console.log(date," ",result1[i].issueDate)
                    carModel.findOneAndUpdate({vehicleNumber:result[_id].vehicleNumber},
                        {$addToSet:{customerId:customerId}},{new:true})
                        .then(suc=>{
                            console.log("-----------",suc)
                            f_result.push(suc)
                            temp =1
                            console.log("f_result----",f_result)
                        })
                        .catch(err=>{
                            callback(err, null)
                            return;
                        })
                }
                if(temp = 1)
                {
                    break;
                }
            }
        })
        .catch(err=>{
            callback(err, null)
            return;
        })
        if(temp = 1)
        {
            break;
        }
    }
    console.log("result-----",result[_id])
    callback(null, result[_id])
    return;
    })
    .catch(err=>{
    callback(err, null)
    return
    })
}
module.exports = router