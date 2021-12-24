const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId

const postSchema = {
    userId : String,
    nickname:String,
    timeOfCreation:Date,
    desc: String,
    feeling:String,
    fileId:[ObjectId],
    tags: [ObjectId],
    likeList:Set(ObjectId),
    totalComments: Number,
    isPublic: {type:Number,max:3,min:0},    
}
const Post = new mongoose.model("Post",postSchema)

module.exports = Post