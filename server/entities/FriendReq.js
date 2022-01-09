"use strict"

class FriendReq{
    static FIELDS = {
        SENDER_ID:'senderId',
        RECEIVER_ID:'receiverId',
        DATE_OF_CREATION:'dateOfCreation',
    }

    constructor(build){
        if(arguments.length===1&&this.validateBuild(build)){
            const senderId = build.senderId;
            const receiverId = build.receiverId;
            const dateOfCreation = build.dateOfCreation;

            Object.defineProperties(this,{
                senderId:{
                    value:senderId,
                    writable:false
                },
                receiverId:{
                    value:receiverId,
                    writable:false
                },
                dateOfCreation:{
                    value:dateOfCreation,
                    writable:false
                }
            });
        }
    }
    validateBuild(build){
        return (String(build.constructor)===String(FriendReq.Builder));
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
            setDateOfCreation(doc){
                this.dateOfCreation = doc;
                return this;
            }
            build(){
                return new FriendReq(this);
            }
        }
        return Builder;
    }
}

module.exports = FriendReq;