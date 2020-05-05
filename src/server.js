let express = require("express");
let app = express()
let cabService = require('./servers/cabService');
let dataBase = require('../database');
let bodyParser = require('body-parser');
const port = process.env.PORT || 3000
app.use(bodyParser.json())
app.use(cabService)
app.use((req, res, next)=>{
    res.status(404).send('Not Found');
})
app.use((err, req, res, next)=>{
    console.log(err.stack)
})
app.listen(port, (err)=>
{
    if (err) throw err;
    else
    {
        console.log("listening");
    }
})