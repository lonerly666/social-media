"use strict";

const FriendReqModel = require("../models/friendReqModel");

class FriendReqManager {
  static async sendFriendReq(friendReq) {
    try {
      const doc = await FriendReqModel.create(this.constructRequest(friendReq));
      return doc;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static constructRequest(friendReq) {
    return {
      senderId: friendReq.senderId,
      receiverId: friendReq.receiverId,
      dateOfCreation: friendReq.dateOfCreation,
    };
  }
  static async removeFriendRequest(reqId){
      try{
          const doc = await FriendReqModel.findByIdAndDelete(reqId);
          return doc;
      }
      catch(err){
          console.log(err);
          throw err;
      }
  }
  static async unsendFriendRequest(senderId,receiverId){
    try{
      await FriendReqModel.deleteOne({senderId:senderId,receiverId:receiverId});
    }
    catch(err){
      console.log(err);
      throw err;
    }
  }
  static async getFriendRequests(userId){
    try{
      const docs = await FriendReqModel.find({receiverId:userId});
      return docs;
    }
    catch(err){
      console.log(err);
      throw err;
    }
  }
  static async getCurrentPending(userId,receiverId){
    try{
      const docs = await FriendReqModel.find({senderId:userId,receiverId:receiverId});
      return docs;
    }
    catch(err){
      console.log(err);
      throw err;
    }
  }
}
module.exports = FriendReqManager;
