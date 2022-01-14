require("dotenv").config({ path: __dirname + "/../.env" });
const notificationManager = require('../dbmangers/NotificationManager');
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const upload = multer();

router.post('/getAll',upload.none(),async(req,res)=>{
    try{
        const doc = await notificationManager.getAllNotification(req.user._id);
        res.send({
            statusCode:statusCodes.OK_STATUS_CODE,
            message:doc
        });
    }
    catch(err){
        console.log(err);
        res.send({
            statusCode:statusCodes.ERR_STATUS_CODE,
            message:"Ooops there is something wrong with the server please try again later"
        })
    }
    
})

module.exports = router;