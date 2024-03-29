const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId

const commentSchema={
    postId:ObjectId,
    creatorId:ObjectId,
    dateOfCreation:Date,
    text:String,
    likeList:[ObjectId]
}
const Comment = new mongoose.model("Comment",commentSchema);

module.exports = Comment;