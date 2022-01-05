"use strict"

class Post{
    static FIELDS = {
        USERID:'userId',
        NICKNAME:'nickname',
        DATE_OF_CREATION: 'dateOfCreation',
        DESC:'desc',
        FEELING:'feeling',
        FILE_ID:'fileId',
        TAGS:'tags',
        LIKE_LIST:'likeList',
        TOTAL_COMMENTS:'totalComments',
        IS_PUBLIC:'isPublic',
        FILES:'files'
    }

    constructor(build){
        if(arguments.length===1&&this.validateBuild(build)){
            const userId = build.userId;
            const nickname = build.nickname;
            const dateOfCreation = build.dateOfCreation;
            const desc = build.desc;
            const feeling = build.feeling;
            const fileId = build.fileId;
            const tags = build.tags;
            const likeList = build.likeList;
            const totalComments = build.totalComments;
            const isPublic = build.isPublic;
            const files = build.files;

            Object.defineProperties(this,{
                userId:{
                    value:userId,
                    writable:false
                },
                nickname:{
                    value:nickname,
                    writable:false
                },
                dateOfCreation:{
                    value:dateOfCreation,
                    writable:false
                },
                desc:{
                    value:desc,
                    writable:false
                },
                feeling:{
                    value:feeling,
                    writable:false
                },
                fileId:{
                    value:fileId,
                    writable:false
                },
                tags:{
                    value:tags,
                    writable:false
                },
                likeList:{
                    value:likeList,
                    writable:false
                },
                totalComments:{
                    value:totalComments,
                    writable:false
                },
                isPublic:{
                    value:isPublic,
                    writable:false
                },
                files:{
                    value:files,
                    writable:false
                },
            });
        }
    }
    validateBuild(build){
        return (String(build.constructor)===String(Post.Builder));
    }
    static get Builder(){
        class Builder{
            setUserId(userId){
                this.userId = userId;
                return this;
            }
            setNickname(nickname){
                this.nickname = nickname;
                return this;
            }
            setDateOfCreation(doc){
                this.dateOfCreation = doc;
                return this;
            }
            setDesc(desc){
                this.desc = desc;
                return this;
            }
            setFeeling(feeling){
                this.feeling = feeling;
                return this;
            }
            setFileId(fileId){
                this.fileId = fileId;
                return this;
            }
            setTags(tags){
                this.tags = tags;
                return this;
            }
            setLikeList(likeList){
                this.likeList = likeList;
                return this;
            }
            setTotalComments(totalComments){
                this.totalComments = totalComments;
                return this;
            }
            setPublic(isPublic){
                this.isPublic = isPublic;
                return this;
            }
            setFiles(files){
                this.files = files;
                return this;
            }
            build(){
                return new Post(this);
            }
        }
        return Builder;
    }
}

module.exports = Post;