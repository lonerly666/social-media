"use strict"

class Notification{
    static FIELDS = {
        SENDER_ID:'senderId',
        RECEIVER_ID:'receiverId',
        TYPE:'type',
        DATE_OF_CREATION:'dateOfCreation',
        POST_ID:'postId'
    }

    constructor(build){
        if(arguments.length===1&&this.validateBuild(build)){
            const senderId = build.senderId;
            const receiverId = build.receiverId;
            const type = build.type;
            const dateOfCreation = build.dateOfCreation;
            const postId = build.postId;

            Object.defineProperties(this,{
                senderId:{
                    value:senderId,
                    writable:false
                },
                receiverId:{
                    value:receiverId,
                    writable:false
                },
                type:{
                    value:type,
                    writable:false
                },
                dateOfCreation:{
                    value:dateOfCreation,
                    writable:false
                },
                postId:{
                    value:postId,
                    writable:false
                }
            });
        }
    }
    validateBuild(build){
        return (String(build.constructor)===String(Notification.Builder));
    }
    static get Builder(){
        class Builder{
            setSenderId(senderId){
                this.senderId = senderId;
                return this;
            }
            setReceiverId(receiverId){
                this.receiverId = receiverId;
                return this;
            }
            setType(type){
                this.type = type;
                return this;
            }
            setDateOfCreation(doc){
                this.dateOfCreation = doc;
                return this;
            }
            setPostId(postId){
                this.postId = postId;
                return this;
            }
            build(){
                return new Notification(this);
            }
        }
        return Builder;
    }
}

module.exports = Notification;