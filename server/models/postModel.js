const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId

const postSchema = {
    userId : ObjectId,
    timeOfCreation:Date,
    desc: String,
    feeling:String,
    files:[Buffer],
    tags: [ObjectId],
    likeList:[ObjectId],
    totalComments: {type:Number,default:0,min:0},
    isPublic: {type:Number,max:3,min:0},    
}
const Post = new mongoose.model("Post",postSchema)

module.exports = Post