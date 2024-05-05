
const express = require("express")
const cors = require("cors")
const stripe = require("stripe")("sk_test_51P2F0WSDWHs1tezgSOAsm0rhpaMp3uYdVYo6j5070UBE9j3j4e1eFqNUKS69SKjoK1aqVjHbIytK9cbdEV998vM600n0UN2YaN")
require('dotenv').config()
const port =8000
const CLIENT_URL ="https://bakehut.vercel.app"
const URI ="mongodb+srv://shubhammeena1376:9532911687@cluster0.p4q8nwb.mongodb.net/BakehutClient"
const crypto = require("crypto") //phonepe
const axios = require("axios") 
const mongoose = require("mongoose") //phonepe / login
const ClientModel = require("./Models/Client")
const AddressModel = require("./Models/Address")
const ItemModel = require('./Models/orderHistory')
const nodemailer = require("nodemailer")
const JWT = require("jsonwebtoken")
const bcrypt = require("bcrypt")


const app = express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:true})) //phonepe

//mongoose connection 
mongoose.connect(URI)



app.post("/login",async(req,res)=>{
    const {email,password}= req.body
  const MatchData = await ClientModel.findOne({email:email})
  const MatchAddress = await AddressModel.findOne({email:email})
  const PastOrder = await ItemModel.find({email:email})

  if(MatchData){
    if(MatchData.password ===password){
        res.json({success:"success",data:MatchData,address:MatchAddress,allData:PastOrder})
    }else{
        res.json("incorrect password")
    }
  }else{
    res.json("no record existed")
  }
})

app.post("/register",async (req,res)=>{
    try {
        const LoginInfo = await ClientModel.create(req.body)
        res.json(LoginInfo)
        
    } catch (error) {
        res.json(error)
    }
})


app.post("/forgotPassword",async(req,res)=>{
    const {email}= req.body
    const MatchData = await ClientModel.findOne({email:email})

    console.log(MatchData)
   if(!MatchData){
    res.json({status:"User Not found"})
   }
   const token = await JWT.sign({id:MatchData._id},"jwt-secret-key",{expiresIn:"1d"})

   var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "shubham.meena1376@gmail.com",
      pass: "ghxe jqml wjka rxnk"
    }
  });
  
  var mailOptions = {
    from: 'shubham.meena1376@gmail.com',
    to: MatchData.email,
    subject: 'Reset Your Password',
    text: `https://bakehut.vercel.app/reset-password/${MatchData._id}/${token}`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      return res.json({status:"success"})
    }
  });
})


app.post("/reset-password/:id/:token",async(req,res)=>{

try {
    const {id,token}= req.params
    const {password}= req.body
     
    console.log(password)

    JWT.verify(token,"jwt-secret-key",async (err,decode)=>{
try {
    if(err){
        res.json({status:"Error with Token"})
    }else{
    //   const hash = await bcrypt.hash(password,10) 
      await ClientModel.findByIdAndUpdate({_id:id},{$set:{password:password}})
      res.json({msg:"Password Updated Successfully"})
    }
} catch (error) {
    res.json({msg:error})
}

       
    })
} catch (error) {
    res.json({status:error})
}

    
})

app.post("/registerAddress",async (req,res)=>{
try {
    const{email}=req.body
    const LoginAddress = await AddressModel.create(req.body)
    const MatchData = await ClientModel.findOne({email:email})
    if(MatchData){
        if(MatchData.email ===email){
            res.json({success:"success",data:LoginAddress})
        }else{
            res.json([])
        }
      }else{
        res.json("no record existed")
      }
  
} catch (error) {
   res.json(error) 
}
})


app.post('/updateAddress',async(req,res)=>{
    const {addDetails} =  req.body
    const {_id,Name,Address,pinCode,city}= addDetails
    const updateData = await AddressModel.findByIdAndUpdate({_id:_id},{$set:{Name:Name,Address:Address,pinCode:pinCode,city:city}},{new:true,useFindAndModify:false})
    console.log(updateData)
    if (updateData){
        res.json(updateData)
    }else{
        res.json("error in updating")
    }

})


app.post("/removeAddress",async (req,res)=>{
    const {addDetails} =  req.body
    const {_id}= addDetails
    const removeData = await AddressModel.deleteMany({_id:_id})
    if(removeData){
        console.log(removeData)
        res.json("data removed successfully")
    }
})

app.post("/orderHistory",async (req,res)=>{

    try {
        const {cartItems,email}= req.body
        const data = {
            "email": email,
            "items": cartItems
          };
        // const LoginAddress = await AddressModel.create(cartItems)
        const currentOrder = await ItemModel.insertMany(data);
        const MatchData = await ClientModel.findOne({email:email})
        const PastOrder = await ItemModel.find({email:email})
        if(MatchData){
            if(MatchData.email ===email){
                res.json({success:"success",data:currentOrder,allData:PastOrder})
            }else{
                res.json([])
            }
          }else{
            res.json("no record existed")
          }

    } catch (error) {
      res.json(error)  
    }
})
//phonepe keys

let salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
let merchant_id = "PGTESTPAYUAT"


//phonepe api
app.get("/",(req,res)=>{
    res.send("hello user")
})
app.post(("/order",async(req,res)=>{
    try {
        const data ={
            merchantId:merchant_id,
            name:req.body.name,
            amount:req.body.price || product.defaultPrice,
            quantity:1,
            redirectUrl:`${CLIENT_URL}/success`,
            redirectMode:"POST",
            paymentInstrument:{
                type:"PAY_PAGE"
            }
        }

        const payload =JSON.stringify(data)
        const payloadMain = Buffer.from(payload).toString('base64')
        const keyIndex = 1
        const string= payloadMain+"/pg/v1/pay"+salt_key
        const sha256 =crypto.createHash('sha256').update(string).digest('hex')
        const checksum = sha256 + "###"+keyIndex

        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"

        const options ={
            method:'POST',
            url:prod_URL,
            headers:{
                accept:'application/json',
                "Content-Type":"application/json",
                "X-VERIFY":checksum
            },
            data:{
                request:payloadMain
            }
        }

        await axios(options).then((response)=>{
            console.log(response.data)
            return res.json(response.data)
        }).catch((err)=>{
            console.log(err)
        })

        
        } catch (error) {
        
    }
}))





//checkout stripe api

app.post("/api/create-checkout-session",async(req,res)=>{
    const {products }= req.body 
    console.log(products)
    const lineItems = products.map((product,i,arr)=>({
price_data:{
    currency:"inr",
    product_data:{
        name:product.name
    },
    unit_amount:product.price || product.defaultPrice,
},
quantity:1
    }))
    console.log(lineItems)
    const session = await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        line_items:lineItems,
        mode:"payment",
        success_url:`${CLIENT_URL}/my-account`,
        cancel_url:`${CLIENT_URL}/cancel`,
    });
    res.json({id:session.id})
})
app.listen(8000,()=>{
    console.log(`listining to port ${8000}`)
})
