"use strict";

const NotificationModel = require('../models/notificationModel');

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
      type:notification.type
    };
  }
  static async removeNotification(postId,senderId,receiverId){
    try{
        await NotificationModel.findOneAndDelete({postId:postId,senderId:senderId,receiverId:receiverId});
    }
    catch(err){
        console.log(err);
        throw err;
    }
  }
  static async getAllNotification(userId){
    try{
      const docs = await NotificationModel.find({receiverId:userId});
      return docs;
    }
    catch(err){
      console.log(err);
      throw err;
    }
  }
}

module.exports = NotificationManager;
