const mongoose = require("mongoose")

const ClientSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
    },
    email:String,
    password:String

})



const ClientModel = mongoose.model("customer",ClientSchema)

module.exports = ClientModel