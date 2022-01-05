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
      timeOfCreation: post.timeOfCreation,
      userId: post.userId,
      isPublic: post.isPublic,
      nickname: post.nickname,
      files:post.files
    };
  }
  static async editPost(postId,post){
    try{
      const docs = await postModel.findByIdAndUpdate(postId,post,{new:true});
      return docs;
    }
    catch(err){
      console.log(err);
      return err;
    }
  }
  static async updatePostFile(postId,fileId){
    try{
      await postModel.findByIdAndUpdate(postId,{fileId:fileId},{new:true});
    }
    catch(err){
      console.log(err);
      return err;
    }
  }
  static async getAllPost(userId, friendlist) {
    try {
      const docs = await postModel.find({
        $or: [
          {
            userId: userId,
          },
          {
            userId: { $in: friendlist },
            $and: [
              {
                $or: [
                  {
                    isPublic: 1,
                  },
                  {
                    isPublic: 2,
                  },
                ],
              },
            ],
          },
        ],
      }).sort({timeOfCreation:-1}).exec();
      return docs;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}

module.exports = PostManager;
