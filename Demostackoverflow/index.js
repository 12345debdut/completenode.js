const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const passport = require('passport');
const ejs = require('ejs');
const session = require('express-session');
const cookieparser = require('cookie-parser');
const key = require("./setup/myurl");
const jsonwt = require("jsonwebtoken");

//bring all routes
const auth=require("./routes/api/auth");
const profile=require("./routes/api/profile");
const questions=require("./routes/api/questions");
const signup=require("./views/signup/signup.ejs");
const login = require("./views/login/login.ejs");

const app=express();
const port=process.env.PORT||3000


//set up for ejs
app.set('views', __dirname + '/views');
app.set(express.static(__dirname + '/public'));
//app.set('views', __dirname + '/views/signup');
//app.set('views', __dirname + '/views/login');
app.set("view engine","ejs");
//static file setup
app.use("/signup",(req,res,next)=>{
    //console.log(req.url);
    next();
});
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views/signup'));
app.use(express.static(__dirname + '/views/login'));
//session middleware:
app.use(cookieparser());
app.use(session({secret:'my new home',
        resave:true,
    saveUninitialized:true
    }));
//profile page loading
app.get("/profile",(req,res)=>{
    res.render("registereduser/profile/index");
})
//testing purpose
app.get("/abc",(req,res)=>{
    res.render("abc");
})
//home page shifting
app.get("/",(req,res)=>{
    res.render("index");
});
app.get("/signup",(req,res)=>{
    res.render("signup/signup");
})
app.get("/login",(req,res)=>{
    res.render("login/login");
})
app.get("/",(req,res)=>{
    res.render("index");
})
app.get("/forgotpassword",(req,res)=>{
    res.render("forgot/login");
})
app.get("/phone",(req,res)=>{
    res.render("forgot/index",{random:req.session.random});
})
app.get("/reset",(req,res)=>{
    res.render("forgot/reset");
})
app.get("/actualprofile",(req,res)=>{
    res.render("profile/index");
})
app.get("/registereduser",(req,res)=>{
    //console.log(auth.router.username);
    //console.log(req.cookies);
    res.render("registereduser/index",{name:req.session.name,email:req.session.email,token:req.cookies.token,userid:req.session.userid});
   // console.log(req.session);
})
//question upload page
app.get("/questionupload",(req,res)=>{
    res.render("questionupload/index");
})
//page faut occure 
//it is for noemail
app.get("/pagefault/noemail/",(req,res)=>{
    res.render("pagenotfound/index",{massage:"Email id is not correct"});
})
//it is used for when user is not giving the correct password;
app.get("/pagefault/passwordnotcorrect/",(req,res)=>{
    res.render("pagenotfound/index",{massage:"Password is not correct"});
});
app.get("/OTPnotcorrect",(req,res)=>{
    res.render("pagenotfound/index",{massage:"OTP is not correct"});
});
//user have asked all questions
app.get("/userquestions",(req,res)=>{
    res.render("userquestions/index");
})
//all questions by all users
app.get("/allquestions",(req,res)=>{
    res.render("allquestions/index");
})
//to answer the following questions
app.get("/answers",(req,res)=>{
    res.render("answers/index");
})
//middleware for bodyparser
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

//mongodb configuration
const db = require("./setup/myurl").mongourl;

//attempt to connect to database

mongoose
.connect(db)
    .then(()=>console.log('Mongodb connected successfully'))
        .catch((err)=>console.log(err));

//passport middleware
app.use(passport.initialize());
//config for jwt strategy
const webtoken=require("./strategy/json-wtstrategy");
webtoken(passport);
//middleware for jsonwebtoken
app.use('/api/profile', passport.authenticate('jwt', {session: false}), profile);
//just for testing route
// app.get('/',(req,res)=>{
//     res.send("hey there bigstack");
// })
//actual routes
app.use('/api/auth',auth);
app.use('/api/profile',profile);
app.use('/api/questions',questions);
app.use('/signup',signup);
app.use('/login',login);
app.listen(port,()=>{
    console.log("port is running at 3000.....");
})