"use strict";

const postModel = require("../models/postModel");

class PostManager {
  static async createPost(post) {
    try {
      const docs = await postModel.create(this.constructPost(post));
      return docs;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  static constructPost(post) {
    return {
      feeling: post.feeling,
      desc: post.desc,
      tags: post.tags,
      fileId: post.fileId,
      timeOfCreation: post.dateOfCreation,
      userId: post.userId,
      isPublic: post.isPublic,
      nickname: post.nickname,
      files: post.files,
    };
  }
  static async editPost(postId, post, files, filesToDelete) {
    try {
      await this.addPostFile(postId, files);
      for (let i = 0; i < filesToDelete.length; i++) {
        await this.deletePostFile(postId, filesToDelete[i]);
      }
      await postModel.findByIdAndUpdate(postId, { $pull: { files: null } });
      const docs = await postModel.findByIdAndUpdate(postId, post, {
        new: true,
      });
      return docs;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  static async deletePost(postId) {
    try {
      await postModel.findByIdAndDelete(postId);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async addPostFile(postId, file) {
    try {
      await postModel.findByIdAndUpdate(postId, {
        $push: { files: { $each: file } },
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async deletePostFile(postId, index) {
    try {
      const query = "files." + index;
      await postModel.findByIdAndUpdate(postId, { $set: { [query]: null } });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async getAllPost(userId, friendlist) {
    try {
      const docs = await postModel
        .find({
          $or: [
            {
              userId: userId,
            },
            {
              isPublic: 1,
            },
            {
              $and: [
                {
                  userId: { $in: friendlist },
                  isPublic: 2,
                },
              ],
            },
          ],
        })
        .sort({ timeOfCreation: -1 })
        .exec();
      return docs;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async likePost(postId, newLike, isLike) {
    try {
      if (isLike) {
        await postModel.findByIdAndUpdate(postId, {
          $push: { likeList: newLike },
        });
      } else {
        await postModel.findByIdAndUpdate(postId, {
          $pull: { likeList: newLike },
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async updateTotalComment(postId, isDelete) {
    try {
      if (isDelete) {
        await postModel.findByIdAndUpdate(postId, {
          $inc: { totalComments: -1 },
        });
      } else
        await postModel.findByIdAndUpdate(postId, {
          $inc: { totalComments: 1 },
        });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async getPostByUser(userId, userFriend, myId) {
    try {
      const docs = await postModel
        .find({
          $and: [
            { userId: userId },
            {
              $or: [
                {
                  isPublic: 1,
                },
                {
                  $and: [{ userId: { $in: userFriend }, isPublic: 2 }],
                },
                {
                  userId: myId,
                },
              ],
            },
          ],
        })
        .sort({ timeOfCreation: -1 })
        .exec();
      return docs;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async updatePostUsername(userId, username) {
    try {
      await postModel.updateMany({ userId: userId }, { nickname: username });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

module.exports = PostManager;
