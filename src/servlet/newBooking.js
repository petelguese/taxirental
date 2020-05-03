let express = require("express");


exports.bookMyRide = function() {
    console.log("inside booking");
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017";

    MongoClient.connect(url, function(err, db){
        if(err) throw err;
        console.log("database created");
        var dbo = db.db("mydb")
        var myobj = {name: "name", age: "123"}
        dbo.collection("customers").insertOne(myobj, function(err, res){
            if (err) throw err;
            console.log("inserted");
        })
        dbo.collection("customers").findOne({}, function(err, res){
            if (err) throw err;
            console.log(res);
        })
    });
}