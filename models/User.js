//making schema for a user loging, (call mongoose, make schema, create model, export the model)
const mongoose = require('mongoose');
const Userschema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        require: true,
        default: Date.now
    },
    otp:{
       type : String,
       
    }
    
})
//we are creating th model first arg is the name of collection in database and the second is which type of schema is
const User=mongoose.model('User', Userschema);

//when we are using findOne form database to prevent form extra space of indexing
// User.createIndexes();//the value which is set unique then a index will attached to it.
module.exports = User