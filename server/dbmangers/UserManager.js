"use strict";

const UserModel = require('../models/userModel');


class UserManager{
    
    static async getUser(userId)
    {
        try
        {
            const res = await UserModel.findById(userId)
            return res;
        }
        catch(err)
        {
            console.log(err);
            return err;
        }
    }
    static async saveUserInfo(user,userId,url)
    {
        try
        {
            const doc = await UserModel.findByIdAndUpdate(userId,this.constructUser(user),{new:true});
            return doc;
        }
        catch(err)
        {
            console.log(err);
            return err;
        }
    }
    static constructUser(user)
    {
        return{
            nickname:user.nickname,
            dateOfBirth:user.dateOfBirth,
            gender:user.gender,
            bio:user.bio,
            profileImage:user.profileImage
        }
    }
}

module.exports = UserManager;