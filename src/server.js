let express = require("express");
let app = express()
let booking = require('./servlet/newBooking');
let cabService = require('./servers/cabService');
let dataBase = require('../database');
let bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(cabService)
app.use((req, res, next)=>{
    res.status(404).send('Not Found');
})
app.use((err, req, res, next)=>{
    console.log(err.stack)
})
app.listen(3000, (err)=>
{
    if (err) throw err;
    else
    {
        console.log("listening");
    }
})