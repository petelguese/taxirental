let mongoose = require('mongoose');

const add = 'localhost:27017';
const dataBase = 'taxiRentalDB';

console.log("database");

class Database {
    constructor() {
      this._connect()
    }
    
  _connect() {
         mongoose.connect(`mongodb://${add}/${dataBase}`)
         .then(() => {
           console.log('Database connection successful')
         })
         .catch(err => {
           console.error('Database connection error')
         })
    }
  }
module.exports = new Database()