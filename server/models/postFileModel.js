const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId

const fileSchema={
    postId:ObjectId,
    file:Buffer
}

const File = new mongoose.model("PostFile",fileSchema);
module.exports = File;