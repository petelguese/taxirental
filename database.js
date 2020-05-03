let mongoose = require('mongoose');

const add = 'mongodb+srv://muralikrishnaDB:rainbow123_@cluster0-fuarp.mongodb.net/test?retryWrites=true&w=majority';
const dataBase = 'taxiRentalDB';

console.log("database");

class Database {
    constructor() {
      this._connect()
    }
    
  _connect() {
         mongoose.connect(`${add}/${dataBase}`)
         .then(() => {
           console.log('Database connection successful')
         })
         .catch(err => {
           console.error('Database connection error')
         })
    }
  }
module.exports = new Database()