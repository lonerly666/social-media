require("dotenv").config({ path: __dirname + "/../.env" });
const Post = require("../entities/Post");
const PostFile = require("../entities/PostFile");
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

router.post("/all", upload.none(), async (req, res) => {
  const userId = req.user._id;
  const friendlist = req.user.friendList;
  try {
    const docs = await postManager.getAllPost(userId, friendlist);
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
    .build();
  try {
    const docs = await postManager.createPost(post);
    if (fileBuffer.length > 0) {
      for (let i = 0; i < fileBuffer.length; i++) {
        const postFiles = new PostFile.Builder()
          .setPostId(docs._id)
          .setFile(fileBuffer[i])
          .build();
        const files = await postFileManager.uploadFile(postFiles);
        fileId.push(files);
      }
      await postManager.updatePostFile(docs._id,fileId);
    }
    res.send({
      statusCode: statusCodes.SUCCESS_STATUS_CODE,
      message: "Successfully created a post!",
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
  let fileId = [];
  if (req.files) {
    for (let i = 0; i < req.files.length; i++) {
      fileId.push(req.files[i].id);
    }
  }
  const postId = req.body.postId;
  const post = new Post.Builder()
    .setFeeling(req.body.feeling)
    .setDesc(req.body.desc)
    .setPublic(req.body.public)
    .setTags(req.body.tags)
    .setFileId(fileId)
    .build();
  try {
    const docs = await postManager.editPost(postId, post);
    if (fileId.length > 0) {
      const postFiles = new PostFile.Builder()
        .setPostId(docs._id)
        .setFile(req.files.buffer)
        .build();
      await postFileManager.uploadFile(postFiles);
    }

    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: "",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message: err,
    });
  }
});

module.exports = router;
