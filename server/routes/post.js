require("dotenv").config({ path: __dirname + "/../.env" });
const Post = require("../entities/Post");
const postManager = require("../dbmangers/PostManager");
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const upload = multer();

router.post("/all", upload.none(), async (req, res) => {
  const userId = req.user._id;
  const friendlist = req.user.friendList;
  try {
    const docs = await postManager.getAllPost(userId, friendlist);
    let fileId = docs.map((post) => {
      return post._id;
    });
    // const docFiles = await postFileManager.downloadFile(fileId);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: docs,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message: "Something wrong with the server, please try again later",
    });
  }
});
router.post("/create", upload.any(), async (req, res) => {
  let fileBuffer = [];
  let fileId = [];
  if (req.files) {
    for (let i = 0; i < req.files.length; i++) {
      fileBuffer.push(req.files[i].buffer);
    }
  }
  const userId = req.user._id;
  const post = new Post.Builder()
    .setFeeling(req.body.feeling)
    .setDesc(req.body.desc)
    .setDateOfCreation(new Date())
    .setPublic(JSON.parse(req.body.public))
    .setTags([])
    .setNickname(req.user.nickname)
    .setUserId(userId)
    .setFiles(fileBuffer)
    .build();
  try {
    const doc = await postManager.createPost(post);
    // if (fileBuffer.length > 0) {
    //   for (let i = 0; i < fileBuffer.length; i++) {
    //     const postFiles = new PostFile.Builder()
    //       .setPostId(docs._id)
    //       .setFile(fileBuffer[i])
    //       .build();
    //     const files = await postFileManager.uploadFile(postFiles);
    //     fileId.push(files);
    //   }
    //   await postManager.updatePostFile(docs._id, fileId);
    // }
    res.send({
      statusCode: statusCodes.SUCCESS_STATUS_CODE,
      message: doc,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message: err,
    });
  }
});
router.post("/edit", upload.any(), async (req, res) => {
  let fileBuffers = [];
  if (req.files) {
    req.files.map((file) => {
      fileBuffers.push(file.buffer);
    });
  }
  let tags = [];
  for (let i = 0; i < req.body.tags; i++) {
    tags.push(req.body.tags[i]);
  }
  const postId = req.body.postId;
  let filesToDelete = [];
  const post = new Post.Builder()
    .setFeeling(req.body.feeling)
    .setDesc(req.body.desc)
    .setPublic(JSON.parse(req.body.public))
    .setTags(tags);
  try {
    if (req.body.toDelete) filesToDelete = [...JSON.parse(req.body.toDelete)];
    const docs = await postManager.editPost(postId, post, fileBuffers,filesToDelete);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: docs,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message: err,
    });
  }
});

router.delete("/delete", upload.none(), async (req, res) => {
  try {
    await postManager.deletePost(req.body.postId);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: "Successfully deleted!",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message: "Ooopss something wrong with the server, please try again later",
    });
  }
});

router.post("/like",upload.none(),async(req,res)=>{
  const post = new Post.Builder()
  .setLikeList(JSON.parse(req.body.likeList))
  try{
    await postManager.likePost(req.body.postId,post)
    res.send({
      statusCode:statusCodes.OK_STATUS_CODE,
      message:""
    })
  }
  catch(err){
    console.log(err);
    res.send({
      statusCode:statusCodes.ERR_STATUS_CODE,
      message:"Ooops something went wrong in the server, please try again later"
    })
  }
})
module.exports = router;
