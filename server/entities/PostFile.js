"use strict"

class PostFile{
    static FIELDS = {
        POST_ID:'postId',
        FILE:'file'
    }

    constructor(build){
        if(arguments.length===1&&this.validateBuild(build)){
            const postId = build.postId;
            const file = build.file

            Object.defineProperties(this,{
                postId:{
                    value:postId,
                    writable:false
                },
                file:{
                    value:file,
                    writable:false
                }
            });
        }
    }
    validateBuild(build){
        return (String(build.constructor)===String(PostFile.Builder));
    }
    static get Builder(){
        class Builder{
            setPostId(postId){
                this.postId = postId;
                return this;
            }
            setFile(file){
                this.file = file;
                return this;
            }
            build(){
                return new PostFile(this);
            }
        }
        return Builder;
    }
}