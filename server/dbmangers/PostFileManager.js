"use strict"

const fileModel = require('../models/postFileModel');

class PostFileManager{
    static async uploadFile(file){
        try{
            await fileModel.create(this.constructFile(file))
        }
        catch(err){
            console.log(err);
            return err;
        }
    }
    static constructFile(file){
        return{
            postId:file.postId,
            file:file.file
        }
    }
}
module.exports = PostFileManager;