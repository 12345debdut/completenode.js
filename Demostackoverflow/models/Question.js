const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    user:{
        type:String,
        required:true
    },
    textone:{
        type:String,
        required:true
    },
    texttwo:{
        type:String,
        required:true
    },
    name:{
        type:String
    },
    answers:[{
        user:{
            type:Schema.Types.ObjectId,
            ref:"myperson"
        },
        text:{
            type:String,
            required:true
        },
        name:{
            type:String
        },
        date:{
            type:Date,
            default: Date.now
        }
    }],
    upvotes:[
        {
            user:{
                type:String,
                required:true
            }
        }
    ],
    date:{
        type:Date,
        default:Date.now
    }
});
module.exports = Question = mongoose.model("myquestion",QuestionSchema);