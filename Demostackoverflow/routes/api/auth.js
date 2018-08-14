const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport")
const key = require("../../setup/myurl");
const mongoose= require('mongoose');
const session = require('express-session');
const LocalStorage  =require('node-localstorage').LocalStorage;
const multer = require('multer');
var path= require('path');
var requestPromise = require('request-promise');
const Nexmo = require('nexmo');
var token;
var one;
var emailvalidator;
var id;
//const localstorage= new LocalStorage('./'); 
//multer settings for profile pic uploadation
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,"./public/myuploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
      console.log(file);
    }
  })
   
  var upload = multer({ 
      storage: storage
    }).single("profilepic");

router.use(express.static(__dirname + '/views'));
// @type    GET
//@route    /api/auth
// @desc    just for testing
// @access  PUBLIC
router.get("/", (req, res) => res.json({ test: "Auth is being tested" }));

//Import Schema for Person to Register
const Person = require("../../models/Person");

// @type    POST
//@route    /api/auth/register
// @desc    route for registration of users
// @access  PUBLIC

router.post("/register", (req, res) => {
    var file;
    upload(req,res,(error)=>{
        if(error){
            console.log(error);
        }
        else{
            console.log(req.file.filename);
        }
    })
  Person.findOne({ email: req.body.email })
    .then(person => {
      if (person) {
        return res
          .status(400)
          .json({ emailerror: "Email is already registered in our system" });
      } else {
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          gender:req.body.gender,
          phonenumber:req.body.phonenumber,
          profilepic:"myuploads/"+req.file.filename
        });
        req.session.name=newPerson.name;
        //Encrypt password using bcrypt
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            if (err){
                console.log(err);
            }
            newPerson.password = hash;
            console.log(newPerson);
            var promise=newPerson.save();
              promise.then(person =>res.redirect("/login"))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});


// @type    POST
//@route    /api/auth/login
// @desc    route for login of users
// @access  PRIVATE
router.post('/login',(req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    Person.findOne({email:email})
    .then(person=>{
        if(!person){
            return res.redirect("/pagefault/noemail/");
        }
        bcrypt.compare(password, person.password).then((iscorrect) => {
              if(iscorrect){
                  //res.json({success:'user is logged in successfully'});
                  //we can create token and fetching the information creating a information
                const payload = {
                    id:person.id,
                    name:person.name,
                    email:person.email
                };
                jsonwt.sign(
                    payload,
                    key.secret,
                    {expiresIn:3600},
                    (err,token)=>{
                       //console.log(req.session.name);
                       req.session.email=person.email;
                       req.session.name=person.name;
                       req.session.userid = person.id;
                       //req.session.cookie.token = "Bearer "+ token;
                       res.cookie('token',"Bearer "+ token,{expires: new Date()+9999,maxAge:9999});
                       res.redirect("/registereduser");
                       //res.json(token);
                    }
                )
              }  
              else{
                  res.redirect("/pagefault/passwordnotcorrect/");
              }
        })
        .catch(err=>{console.log(err)});
    })
    .catch(err=>console.log(err));
})
// @type    POST
//@route    /api/auth/forgotpassword
// @desc    it is for user forgot password
// @access  PRIVATE
router.post('/forgotpassword',(req,res)=>{
    const email = req.body.email;
    emailvalidator=email;
    Person.findOne({email:email})
    .then(person=>{
        if(!person){
            res.redirect("pagefault/noemail");
        }
        else{
            id=person.id;
            req.session.phonenumber = person.phonenumber;
            var phonenumber=person.phonenumber;
            req.session.lastdigit=(person.phonenumber)%10;
            const nexmo = new Nexmo({
                apiKey: '09494dd5',
                apiSecret: '0qOfYYqp9slmrl3W'
              });
              const random = Math.floor((Math.random() * 10000) + 1000);
              req.session.random=random;
              one = random;
              const from = 'Nexmo';
              const to = 91+phonenumber;
              const text = random+"it is your OTP verification code";
              //console.log(to);
              nexmo.message.sendSms(from, to, text, (error, response) => {
                if(error) {
                  throw error;
                }else {
                  console.log(response);
                }
              });
            res.redirect("/phone");
        }
    })
})
//otp checking and redirected to password reset page
router.post("/checking",(req,res)=>{
    const OTP= req.body.otp;
    if(one==OTP){
        res.redirect("/reset");
    }
    else{
        res.redirect("/OTPnotcorrect");
    }
})
//password reset post request is here
router.post("/reset",(req,res)=>{
    var password = req.body.newpassword;
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err){
              console.log(err);
          }
          password= hash;
        });
      });
      //console.log(password);
      //console.log(id);
      //console.log(emailvalidator);
      Person.findOne({email:emailvalidator})
      .then(profile=>{
          if(profile){
              Person.findOneAndUpdate(
                  {"_id":id},
                  {$set:{password:password}},{new:true}
              )
              .then(profile=>console.log(profile))
              .catch(err=>console.log('problem in update'+ err))
          }
      })
})
// @type    POST
//@route    /api/auth
// @desc    it is for prfile updation
// @access  PRIVATE
router.post("/",(req,res)=>{
    const profilevalues = {};
    //console.log(req.body.email);
    //profilevalues.user = req.user.id;
    //console.log(req.body.email)
    console.log("the userid is"+req.body.userid);
    profilevalues.user=req.body.userid;
    if(req.body.username) profilevalues.username = req.body.username;
    if(req.body.website) profilevalues.website = req.body.website;
    if(req.body.country) profilevalues.country = req.body.country;
    if(typeof req.body.languages!=undefined) {
        profilevalues.languages=req.body.languages;
    }
    if(req.body.portfolio) profilevalues.portfolio = req.body.portfolio;
    //get social links
    profilevalues.social={};
    if(req.body.youtube)profilevalues.social.youtube= req.body.youtube;
    if(req.body.instagram) profilevalues.social.instagram = req.body.instagram;
    if(req.body.facebook) profilevalues.social.facebook=req.body.facebook;
    console.log(profilevalues);
    console.log(req.body.username);
    //Do database stuff
    Profile.findOne({user:req.body.userid})
    .then(profile=>{
        if(profile){
            Profile.findOneAndUpdate(
                {user:req.body.userid},
                {$set:{
                    languages:req.body.languages,
                    username:req.body.username,
                    website:req.body.website,
                    country:req.body.country,
                    portfolio:req.body.portfolio,
                    social:{youtube:req.body.youtube,instagram:req.body.instagram,facebook:req.body.facebook}
                }},{returnNewDocument: true}
            )
            .then(profile=>res.json(profile))
            .catch(err=>console.log('problem in update'+ err))
        }
        else{
            Profile.findOne({username:profilevalues.username})
            .then(profile=>{
                //username already exists
                if(profile){
                    res.status(400).json({username:'Username already exists'})
                }
                else{
                    new Profile(profilevalues).save()
                    .then(profile=>res.json(profile))
                    .catch(err=>console.log(err));
                }
            })
            .catch(err=>console.log(err));
        }
    })
    .catch(err=>console.log(err))


});
// @type    GET
//@route    /api/auth/profile
// @desc    it is for user profile
// @access  PRIVATE
router.get("/profile",passport.authenticate('jwt',{session:false}),(req,res)=>{
    //console.log(req.user.email);
    //console.log(req.user);
    values = {};
    Person.findOne({_id:req.user.id})
    .then(person=>{
        if(!person){
            console.log("there are no such profile found");
        }
        else{
            console.log(person);
            Profile.findOne({user:req.user.id})
            .then(profile=>{
                values.profile=profile;
                values.profilepic=req.user.profilepic;
                values.gender=req.user.gender;
                values.phonenumber=req.user.phonenumber;
                //console.log(person.profilepic);
                res.send(values);
            })
            .catch(err=>{console.log("error finding value"+err)})
        }
    }).catch(err=>console.log("error finding value of person"));
})
router.post("/abc",passport.authenticate('jwt',{session:false}),(req,res)=>{
    console.log(req);
})
module.exports =id;
module.exports = router;