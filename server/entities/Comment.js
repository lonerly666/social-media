"use strict"

class Comment{
    static FIELDS = {
        POST_ID:'postId',
        CREATOR_ID:'creatorId',
        DATE_OF_CREATION:'dateOfCreation',
        TEXT:'text',
        LIKE_LIST:'likeList',
    }

    constructor(build){
        if(arguments.length===1&&this.validateBuild(build)){
            const postId = build.postId;
            const creatorId = build.creatorId;
            const dateOfCreation = build.dateOfCreation;
            const text = build.text;
            const likeList =build.likeList

            Object.defineProperties(this,{
                postId:{
                    value:postId,
                    writable:false
                },
                creatorId:{
                    value:creatorId,
                    writable:false
                },
                dateOfCreation:{
                    value:dateOfCreation,
                    writable:false
                },
                text:{
                    value:text,
                    writable:false
                },
                likeList:{
                    value:likeList,
                    writable:false
                }
            });
        }
    }
    validateBuild(build){
        return (String(build.constructor)===String(Comment.Builder));
    }
    static get Builder(){
        class Builder{
            setPostId(postId){
                this.postId = postId;
                return this;
            }
            setCreatorId(creatorId){
                this.creatorId = creatorId;
                return this;
            }
            setDateOfCreation(doc){
                this.dateOfCreation = doc;
                return this;
            }
            setText(text){
                this.text = text;
                return this;
            }
            setLikeList(likeList){
                this.likeList = likeList;
                return this;
            }
            build(){
                return new Comment(this);
            }
        }
        return Builder;
    }
}

module.exports = Comment;