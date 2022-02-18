require("dotenv").config({ path: __dirname + "/../.env" });
const Comment = require("../entities/Comment");
const commentManager = require("../dbmangers/CommentManager");
const postManager = require("../dbmangers/PostManager");
const notificationManager = require("../dbmangers/NotificationManager");
const userManager = require("../dbmangers/UserManager");
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const Notification = require("../entities/Notification");
const upload = multer();

router.post("/", upload.any(), async (req, res) => {
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
      let result = {};
      await notificationManager
        .createNotification(notification)
        .then(async (doc) => {
          const data = doc._doc;
          await userManager.getUsernameAndImage(doc.senderId).then((doc) => {
            result = {
              ...data,
              nickname: doc.nickname,
              image: doc.profileImage,
            };
          });
        });
      io.to(req.body.receiverId).emit("sendNoti", JSON.stringify(result));
    }
    res.send({
      statusCode: statusCodes.SUCCESS_STATUS_CODE,
      message: { ...doc._doc, likers: [] },
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

router.get("/:postId", upload.none(), async (req, res) => {
  try {
    let comments = await commentManager.getAllComment(req.params.postId);
    const result = [];
    comments = await Promise.all(
      comments.map(async (data) => {
        if (data.creatorId.toString() !== req.user._id.toString()) {
          const doc = await userManager.getUsernameAndImage(data.creatorId);
          let nickname = doc.nickname;
          let image = doc.profileImage;
          return { ...data._doc, nickname: nickname, image: image, likers: [] };
          // result.push({
          //   ...data._doc,
          //   nickname: nickname,
          //   image: image,
          //   likers: [],
          // });
        } else {
          return { ...data._doc, likers: [] };
          // result.push({ ...data._doc, likers: [] });
        }
      })
    );
    await Promise.all(
      comments.map(async (data) => {
        const likers = [];
        return await Promise.all(
          data.likeList.map(async (id) => {
            if (id.toString() !== req.user._id.toString()) {
              const doc = await userManager.getUsernameAndImage(id);
              likers.push({
                id: id,
                nickname: doc.nickname,
                image: doc.profileImage,
              });
            } else likers.push({ id: id });
            return (data.likers = likers);
          })
        );
      })
    );
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

router.delete("/", upload.none(), async (req, res) => {
  try {
    await commentManager.deleteComment(req.body.commentId);
    await postManager.updateTotalComment(req.body.postId, true);
    await notificationManager.removeNotification(
      req.body.postId,
      req.user._id,
      req.body.receiverId,
      req.body.type
    );
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
    const io = req.app.get("io");
    const isLike = JSON.parse(req.body.isLike);
    await commentManager.likeComment(
      req.body.commentId,
      req.body.likeList,
      isLike
    );
    if (req.user._id.toString() !== req.body.receiverId) {
      if (isLike) {
        const notification = new Notification.Builder()
          .setDateOfCreation(new Date())
          .setPostId(req.body.postId)
          .setReceiverId(req.body.receiverId)
          .setSenderId(req.user._id)
          .setType(req.body.type)
          .build();
        let result = {};
        await notificationManager
          .createNotification(notification)
          .then(async (doc) => {
            const data = doc._doc;
            await userManager.getUsernameAndImage(doc.senderId).then((doc) => {
              result = {
                ...data,
                nickname: doc.nickname,
                image: doc.profileImage,
              };
            });
          });
        io.to(req.body.receiverId.toString()).emit(
          "sendNoti",
          JSON.stringify(result)
        );
      } else {
        await notificationManager.removeNotification(
          req.body.postId,
          req.user._id,
          req.body.receiverId,
          req.body.type,
        );
      }
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
