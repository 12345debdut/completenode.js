const express=require('express');
const router=express.Router();
const mongoose = require("mongoose");
//Load Person model
const Person = require("../../models/Person");
//Load Profile Model
const Profile = require("../../models/Profile");
//Load question model
const Question = require("../../models/Question");
const passport = require("passport")
//@type : Post
//route: /api/questions
//@desc:route for posting questions
//access: Private
router.post('/',(req,res)=>{
    const newquestion = new Question({
        textone:req.body.textone,
        texttwo:req.body.texttwo,
        name:req.body.name,
        user:req.body.userid
    })
    newquestion.save()
    .then(question=>console.log(question))
    .catch(err=>console.log(err))
})
//@type:GET
//route:/api/questions
//@desc:getting the all questions
router.get("/",passport.authenticate('jwt',{session:false}),(req,res)=>{
    Question.find()
    .sort({date:"desc"})
    .then(questions=>res.send(questions))
    .catch(err=>res.json(err));
})
//@desc:user asked questions in user's account
//@type:GET
//route:/api/questions/user
//PRIVATE
router.get("/user",passport.authenticate('jwt',{session:false}),(req,res)=>{
    Question.find({user:req.user._id})
    .then(questions=>{
        res.send(JSON.stringify(questions));
    })
    .catch(err=>console.log(err));
})
//@type:POST
//route:/api/answers/
//@desc:getting the all questions
//access:PRIVATE
router.post("/answers",(req,res)=>{
    Question.findById(req.body.questionid)
    .then(question=>{
        console.log(question);
        const newAnswer={
            user:req.body.userid,
            name:req.body.name,
            text:req.body.answer
        };
        question.answers.unshift(newAnswer);
        question.save()
        .then(question=>{res.json(question)})
        .catch(err=>console.log(err))
    })
    .catch(err=>console.log(err))
})

module.exports=router;