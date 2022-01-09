const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId

const friendReqSchema = {
    senderId : ObjectId,
    receiverId : ObjectId,
    dateOfCreation : Date,
}
const FriendRequest = new mongoose.model("FriendRequest",friendReqSchema)

module.exports = FriendRequest;