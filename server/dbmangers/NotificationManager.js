"use strict";

import NotificationModel from "../models/notificationModel";

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
    };
  }
  static async removeNotification(notiId){
    try{
        await NotificationModel.findByIdAndDelete(notiId);
    }
    catch(err){
        console.log(err);
        throw err;
    }
  }
}

module.exports = NotificationManager;
