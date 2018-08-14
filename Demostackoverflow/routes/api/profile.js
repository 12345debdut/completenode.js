const express=require('express');
const router=express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Person model
const Person = require("../../models/Person");
const jsonwt = require("jsonwebtoken");

//Load Profile Model
const Profile = require("../../models/Profile");
// @type    GET
//@route    /api/profile
// @desc    it is for user profile
// @access  PRIVATE

router.get("/",passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({
        user:req.user.id})
        .then(profile=>{
            if(!profile){
                return res.status(404).json({profilenotfound:'profile is not found'});
            }
            res.json(profile);
        })
        .catch(err=>console.log(err));    
});
// @type    GET
//@route    /api/profile/:user
// @desc    route for getting user profile based on username
// @access  public
router.get('/:username',(req,res)=>{
    Profile.findOne({username:req.params.username})
    .populate('user',["name","profilepic"])
    .then(profile=>
        {
            if(!profile){
                res.status(404).json({usernotfound:'username is not found'});
            }
            else{
                res.json(profile);
            }
        }
    )
    .catch(err=>console.log('Error in fetching username'))
})


module.exports=router;