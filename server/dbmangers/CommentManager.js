"use strict"

const commentModel = require('../models/commentModel');

class CommentManager{
    static async createComment(comment){
        try{
            const docs = await commentModel.create(this.constructComment(comment));
            return docs;
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }
    static constructComment(comment){
        return{
            postId:comment.postId,
            creatorId:comment.creatorId,
            creator:comment.creator,
            dateOfCreation:comment.dateOfCreation,
            text:comment.text
        }
    }
    static async getAllComment(postId){
        try{
            const docs = await commentModel.find({postId:postId}).sort({ dateOfCreation: -1 }).exec();
            return docs;
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }
    static async deleteComment(commentId){
        try{
            await commentModel.findByIdAndDelete(commentId);
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }
}
module.exports = CommentManager;