const mongo=require('mongoose')
require('dotenv/config')

mongo.connect(process.env.MONGODB_URI,{useNewUrlParser:true, useFindAndModify:false},(err)=>{
    if(!err){
        console.log('MongoDB connected')
    }
    else console.log(err)
})