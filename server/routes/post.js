require("dotenv").config({ path: __dirname + "/../.env" });
const Post = require("../entities/Post");
const postManager = require("../dbmangers/PostManager");
const postFileManager = require("../dbmangers/PostFileManager");
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const upload = multer();

router.post('/all',upload.none(),async(req,res)=>{
    const userId = req.user._id;
    const friendlist = req.user.friendList;
    try{
        const docs = await postManager.getAllPost(userId,friendlist);
        res.send({
            statusCode:statusCodes.OK_STATUS_CODE,
            message:docs
        })
    }
    catch(err){
        console.log(err);
        res.send({
            statusCode:statusCodes.ERR_STATUS_CODE,
            message:"Something wrong with the server, please try again later"
        })
    }
})
router.post('/create',upload.any(),async(req,res)=>{
    let fileId = [];
    if(req.files)
    {
        for(let i =0;i<req.files.length;i++)
        {
            fileId.push(req.files[i].id);
        }
    }
    const userId = req.user._id;
    const post = new Post.Builder()
    .setFeeling(req.body.feeling)
    .setDesc(req.body.desc)
    .setDateOfCreation(req.body.dateOfCreation)
    .setPublic(req.body.public)
    .setTags(req.body.tags)
    .setFileId(fileId)
    .setUserId(userId)
    .build()
    try{
        const docs = await postManager.createPost(post);
        await postFileManager.uploadFile(docs._id,req.files.buffer);
        res.send({
            statusCode:statusCodes.SUCCESS_STATUS_CODE,
            message:"Successfully created a post!"
        })
    }
    catch(err){
        console.log(err);
        res.send({
            statusCode:statusCodes.ERR_STATUS_CODE,
            message:err
        })
    }
})

module.exports = router;