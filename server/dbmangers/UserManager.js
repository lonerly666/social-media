"use strict";

const UserModel = require("../models/userModel");

class UserManager {
  static async getUser(userId) {
    try {
      const res = await UserModel.findById(userId);
      return res;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async downloadUserImage(userId) {
    try {
      const doc = await UserModel.findById(userId);
      return doc.profileImage;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async saveUserInfo(user, userId) {
    try {
      const doc = await UserModel.findByIdAndUpdate(
        userId,
        this.constructUser(user),
        { new: true }
      );
      return doc;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  static constructUser(user) {
    return {
      nickname: user.nickname,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      bio: user.bio,
      profileImage: user.profileImage,
      originalImage: user.originalImage,
      imageDetails:user.imageDetails,
    };
  }
  static async deleteUser(userId) {
    try {
      await UserModel.findByIdAndDelete(userId);
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  static async getUsernameAndImage(userId) {
    try {
      const doc = await UserModel.findById(userId, {
        _id:1,
        nickname: 1,
        profileImage: 1,
      });
      return doc;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async updateFriendList(userId, friendId, adding) {
    try {
      if (adding) {
        await UserModel.findByIdAndUpdate(userId, {
          $push: { friendList: friendId },
        });
        await UserModel.findByIdAndUpdate(friendId, {
          $push: { friendList: userId },
        });
      } else {
        await UserModel.findByIdAndUpdate(userId, {
          $pull: { friendList: friendId },
        });
        await UserModel.findByIdAndUpdate(friendId, {
          $pull: { friendList: userId },
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async checkFriendList(userId, friendId) {
    try {
      const doc = await UserModel.findOne(
        { _id: userId, friendList: { $in: [friendId] } },
        { profileImage: 0, originalImage: 0 }
      );
      return doc;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async getUserByChar(char) {
    try {
      const docs = await UserModel.find({
        nickname: { $regex: char, $options: "i" },
      });
      return docs;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async getUserByFriendList(char, friendList) {
    try {
      const docs = await UserModel.find(
        {
          $and: [
            {
              _id: { $in: friendList },
              nickname: { $regex: char, $options: "i" },
            },
          ],
        },
        { _id: 1, nickname: 1, profileImage: 1 }
      );
      return docs;
    } catch (err) {
      throw err;
    }
  }
  static async getMultipleUsernameAndImage(userList) {
    try {
      const docs = await UserModel.find(
        { _id: { $in: userList } },
        { _id: 1, nickname: 1, profileImage: 1 }
      );
      return docs;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = UserManager;
