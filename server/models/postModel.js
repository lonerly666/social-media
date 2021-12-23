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
    totalLikes: Number,
    totalComments: Number,
    isPublic: Boolean,    
}

const Post = new mongoose.model("Post",postSchema)

module.exports = Post