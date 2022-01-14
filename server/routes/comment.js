require("dotenv").config({ path: __dirname + "/../.env" });
const Comment = require("../entities/Comment");
const commentManager = require("../dbmangers/CommentManager");
const postManager = require("../dbmangers/PostManager");
const notificationManager = require("../dbmangers/NotificationManager");
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const Notification = require("../entities/Notification");
const upload = multer();

router.post("/create", upload.any(), async (req, res) => {
  const comment = new Comment.Builder()
    .setCreatorId(req.user._id)
    .setPostId(req.body.postId)
    .setText(req.body.text)
    .setDateOfCreation(new Date())
    .build();
  try {
    const doc = await commentManager.createComment(comment);
    await postManager.updateTotalComment(req.body.postId, false);
    if (req.user._id.toString() !== req.body.receiverId) {
      const io = req.app.get("io");
      const notification = new Notification.Builder()
        .setDateOfCreation(new Date())
        .setPostId(req.body.postId)
        .setReceiverId(req.body.receiverId)
        .setSenderId(req.user._id)
        .setType(req.body.type)
        .build();
      const doc = await notificationManager.createNotification(notification);
      io.to(req.body.receiverId).emit('sendNoti',(doc));
    }
    res.send({
      statusCode: statusCodes.SUCCESS_STATUS_CODE,
      message: doc,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooopss something went wrong with the server, please try again later",
    });
  }
});

router.post("/all", upload.none(), async (req, res) => {
  try {
    const comments = await commentManager.getAllComment(req.body.postId);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: comments,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooopss something went wrong with the server, please try again later",
    });
  }
});

router.delete("/delete", upload.none(), async (req, res) => {
  try {
    await commentManager.deleteComment(req.body.commentId);
    await postManager.updateTotalComment(req.body.postId, true);
    if(req.user._id.toString()!==req.body.receiverId){
      await notificationManager.removeNotification(req.body.postId,req.user._id,req.body.receiverId);
    }
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooopss something went wrong with the server, please try again later",
    });
  }
});

router.post("/edit", upload.none(), async (req, res) => {
  try {
    const doc = await commentManager.editComment(
      req.body.commentId,
      req.body.text
    );
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: doc,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooopss something went wrong with the server, please try again later",
    });
  }
});

router.post("/like", upload.none(), async (req, res) => {
  try {
    await commentManager.likeComment(
      req.body.commentId,
      req.body.likeList,
      JSON.parse(req.body.isLike)
    );
    if(req.user._id.toString()!==req.body.receiverId){
      const io = req.app.get('io');
      const notification = new Notification.Builder()
      .setReceiverId(req.body.receiverId)
      .setSenderId(req.user._id)
      .setType(req.body.type)
      .setDateOfCreation(new Date())
      .build();
      const doc = await notificationManager.createNotification(notification);
      io.to(req.body.receiverId).emit('sendNoti',(doc));
    }
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: "",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooopss something went wrong with the server, please try again later",
    });
  }
});

module.exports = router;
