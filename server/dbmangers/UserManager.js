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
}

module.exports = UserManager;