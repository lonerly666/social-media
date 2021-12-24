const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId

const commentSchema={
    postId:ObjectId,
    creatorId:ObjectId,
    creator:String,
    dateOfCreation:Date,
    text:String,
    likeList:Set(ObjectId),
}
const Comment = new mongoose.model("Comment",commentSchema);

module.exports = Comment;