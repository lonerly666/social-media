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
    static async saveUserInfo(user,userId)
    {
        try
        {
            const doc = UserModel.findByIdAndUpdate(userId,this.constructUser(user),{new:true});
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
        }
    }
}

module.exports = UserManager;