const mongoose = require("mongoose")

const AddressSchema = new mongoose.Schema({
   
    Name: String,
    Address: String,
    pinCode: String,
    city: String,
    email:String
  });
  
 
  



const AddressModel = mongoose.model("Address",AddressSchema)

module.exports = AddressModel