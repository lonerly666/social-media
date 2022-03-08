const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const passportLocalMongoose = require('passport-local-mongoose');
const ObjectId = require('mongodb').ObjectId;

const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    googleId:String,
    facebookId:String,
    nickname:String,
    dateOfBirth:Date,
    bio:String,
    gender:String,
    friendList:[ObjectId],
    numOfPosts:{type:Number,default:0},
    lastSeenNotification:{type:Date,default:new Date(0)},
    lastSeenFriendRequest:{type:Date,default:new Date(0)},
    profileImage:Buffer,
    originalImage:Buffer,
    imageDetails:Object,
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User",userSchema)

module.exports = User