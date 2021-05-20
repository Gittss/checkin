const express=require('express')
const mongo=require('mongoose')
const path=require('path')
const fs=require('fs')
const User=require('../models/user.model')
const multer=require('multer')
const axios=require('axios').default
require('dotenv/config')
var router=express.Router()

const gmAPI=require('@google/maps').createClient({key:process.env.API_KEY})

const upload=multer({dest:"D:/checkin/public/img"})

router.use(express.json())

router.get('/',(req,res)=>{
    res.render('home')
})

router.get('/signup',(req,res)=>{
    res.render('signup',{title:'Register with us to save your trip memories'})
})

router.post('/signup',(req,res)=>{
    var user=new User()
    user.name=req.body.name
    user.email=req.body.email
    user.pass=req.body.pass
    user.save((err)=>{
        if(!err){
            res.render('profile',{user:req.body, uid:user._id})
        }
        else{
            if(err.name=='ValidationError'){
                handleValidationError(err,req.body)
                res.render('signup',{user:req.body})
            }
            else console.log('Error in signUp')
        }
    })
})

router.get('/signin',(req,res)=>{
    res.render('signin',{title:'Login into your account'})
})

router.post('/signin',(req,res)=>{
    User.findOne({email:req.body.email},(err,doc)=>{
        if(!err){
            if(req.body.email=='' | req.body.pass==''){
                if(req.body.email=='' & req.body.pass=='')
                    res.render('signin',{
                        uid:'Field required',
                        ups:'Field required'
                    })
                else{
                    if(req.body.email=='') res.render('signin',{uid:'Field required'})
                    else if(req.body.pass=='') res.render('signin',{ups:'Field required'})
                }
            }
            else if(!doc){
                res.render('signin',{user: req.body, title:'No such User found'})
            }
            else{
                if(req.body.pass!=doc.pass)
                    res.render('signin',{user: req.body, ups:'Incorrect password'})
                else{
                    console.log(doc.loc.lat+'  '+doc.loc.long)
                    var lat=doc.loc.lat
                    var lng=doc.loc.long
                    axios.get('https://maps.googleapis.com/maps/api/geocode/json',{
                        params:{
                            address:'22 Main st Boston MA',
                            key:process.env.API_KEY
                        }
                    })
                    .then(function(dec){
                        console.log(dec.data.results[0].formatted_address)
                    })
                    .catch(function(err){
                        console.log('Error axios.get :>'+err)
                    });
                    res.render('profile',{user:doc.toObject(), uid:doc._id})
                }
            }
        }
        else console.log(err)
    })
})

router.get('/post:id',(req,res)=>{
    User.findById(req.params.id,(err,doc)=>{
        if(!err) res.render('post',{uid:doc._id})
    })
})

router.post('/post/:lat/:long',upload.single("file"),(req,res)=>{  
    const tempPath=req.file.path
    const targetPath=path.join('D:/checkin/public/img/image.png')
    if(path.extname(req.file.originalname).toLowerCase()==".png" || ".jpg"){
        fs.rename(tempPath,targetPath,(err)=>{
            if(!err){
                User.findById(req.body._id,(err,doc)=>{
                    if(!err){
                        var user=new User()
                        user.name=doc.name
                        user.email=doc.email
                        user.pass=doc.pass
                        user.loc.lat=req.params.lat
                        user.loc.long=req.params.long
                        user.pic.data=fs.readFileSync('D:/checkin/public/img/image.png')
                        user.pic.contentType='image/png'
                        User.findByIdAndRemove(doc._id,(err)=>{
                            user.save((err)=>{
                                if(!err){
                                    res.render('profile',{user:user.toObject(), uid:user._id})
                                }
                            })
                        })
                    }else console.log('FindById Error '+err)
                })
            }
            else console.log(err)
        })
    }
    else{
        fs.unlink(tempPath,(err)=>{
            if(!err) console.log('Only png files are allowed')
            else console.log(err)
        })
    }
})

function handleValidationError(err,body){
    for(field in err.errors)
    {
        switch(err.errors[field].path){
            case 'name':    
                body['nameError']=err.errors[field].message;
                break;
            case 'email':
                body['emailError']=err.errors[field].message;
                break;
            case 'pass':
                body['passError']=err.errors[field].message;
                break;
            default: break;
        }
    }
}

module.exports=router