"use strict";

const NotificationModel = require("../models/notificationModel");

class NotificationManager {
  static async createNotification(notification) {
    try {
      const doc = await NotificationModel.create(
        this.constructNotification(notification)
      );
      return doc;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static constructNotification(notification) {
    return {
      receiverId: notification.receiverId,
      senderId: notification.senderId,
      dateOfCreation: notification.dateOfCreation,
      postId: notification.postId,
      type: notification.type,
    };
  }
  static async removeNotification(postId, senderId, receiverId, type) {
    try {
      await NotificationModel.findOneAndDelete({
        postId: postId,
        senderId: senderId,
        receiverId: receiverId,
        type: type,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async getAllNotification(userId) {
    try {
      const docs = await NotificationModel.find({ receiverId: userId })
        .sort({ dateOfCreation: -1 })
        .exec();
      return docs;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async removeAllNotification(userId){
    try{
      await NotificationModel.deleteMany({receiverId:userId});
    }
    catch(err){
      throw err;
    }
  }
}

module.exports = NotificationManager;
