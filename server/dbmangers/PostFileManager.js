"use strict"

const fileModel = require('../models/postFileModel');

class PostFileManager{
    static async uploadFile(file){
        try{
            const docs =await fileModel.create(this.constructFile(file));
            return docs;
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }
    static constructFile(file){
        return{
            postId:file.postId,
            file:file.file
        }
    }
    static async downloadFile(postId){
        try{
            const docs = await fileModel.find({postId:{$in:postId}});
            return docs;
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }
}
module.exports = PostFileManager;