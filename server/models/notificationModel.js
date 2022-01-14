const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;

const notificationSchema = {
  senderId: ObjectId,
  receiverId: ObjectId,
  type: String,
  dateOfCreation: Date,
  postId:ObjectId,
};
const Notification = new mongoose.model("Notification", notificationSchema);

module.exports = Notification;
