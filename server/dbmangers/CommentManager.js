"use strict";

const commentModel = require("../models/commentModel");

class CommentManager {
  static async createComment(comment) {
    try {
      const docs = await commentModel.create(this.constructComment(comment));
      return docs;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static constructComment(comment) {
    return {
      postId: comment.postId,
      creatorId: comment.creatorId,
      dateOfCreation: comment.dateOfCreation,
      text: comment.text,
    };
  }
  static async getAllComment(postId) {
    try {
      const docs = await commentModel
        .find({ postId: postId })
      return docs;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async deleteComment(commentId) {
    try {
      await commentModel.findByIdAndDelete(commentId);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async editComment(commentId, text) {
    try {
      const docs = await commentModel.findByIdAndUpdate(
        commentId,
        { text: text },
        {
          new: true,
        }
      );
      return docs;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async likeComment(commentId,likeList,isLike){
    try {
      if(isLike){
        await commentModel.findByIdAndUpdate(commentId,{$push:{likeList:likeList}});
      }
      else{
        await commentModel.findByIdAndUpdate(commentId,{$pull:{likeList:likeList}});
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async deleteCommentByPost(postId){
      try{
        await commentModel.deleteMany({postId:postId});
      }
     catch(err){
         console.log(err);
         throw err;
     }
  }
}
module.exports = CommentManager;
