const mongo=require('mongoose')

var userSchema=new mongo.Schema({
    name:{type:String, required:'Field required'},
    email:{type:String, required:'Field required'},
    pass:{type:String, required:'Field required'},
    pic:{data:Buffer, contentType:String},
    loc:{
        lat:{type:String},
        long:{type:String}
    }
})

const User=mongo.model('User',userSchema)
module.exports=User