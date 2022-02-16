require("dotenv").config({ path: __dirname + "/../.env" });
const Post = require("../entities/Post");
const Notification = require("../entities/Notification");
const postManager = require("../dbmangers/PostManager");
const commentManager = require("../dbmangers/CommentManager");
const userManager = require("../dbmangers/UserManager");
const notificationManager = require("../dbmangers/NotificationManager");
const router = require("express").Router();
const statusCodes = require("../statusCodes");
const POST_NUM_SKIP = 5;
const multer = require("multer");
const upload = multer();

router.post("/all", upload.none(), async (req, res) => {
  const userId = req.user._id;
  const friendlist = req.user.friendList;
  const numOfSkip = JSON.parse(req.body.numOfSkip);
  try {
    const docs = await postManager.getAllPost(userId, friendlist,numOfSkip);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: docs,
      numOfSkip: numOfSkip+POST_NUM_SKIP
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
    .setTags(JSON.parse(req.body.tags))
    .setNickname(req.user.nickname)
    .setUserId(userId)
    .setFiles(fileBuffer)
    .build();
  try {
    const io = req.app.get("io");
    const doc = await postManager.createPost(post);
    await Promise.all(
      JSON.parse(req.body.tags).map(async (data) => {
        const notification = new Notification.Builder()
          .setDateOfCreation(new Date())
          .setPostId(doc._id)
          .setReceiverId(data)
          .setSenderId(req.user._id)
          .setType("TAG")
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
        io.to(data.toString()).emit("sendNoti", JSON.stringify(result));
      })
    );
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
      message: { ...doc._doc, likers: [] },
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
  const postId = req.body.postId;
  let filesToDelete = [];
  const post = new Post.Builder()
    .setFeeling(req.body.feeling)
    .setDesc(req.body.desc)
    .setPublic(JSON.parse(req.body.public))
    .setTags(JSON.parse(req.body.tags));
  try {
    const io = req.app.get("io");
    if (req.body.toDelete) filesToDelete = [...JSON.parse(req.body.toDelete)];
    const docs = await postManager.editPost(
      postId,
      post,
      fileBuffers,
      filesToDelete
    );
    await Promise.all(
      JSON.parse(req.body.newTags).map(async (data) => {
        const notification = new Notification.Builder()
          .setDateOfCreation(new Date())
          .setPostId(req.body.postId)
          .setReceiverId(data)
          .setSenderId(req.user._id)
          .setType("TAG")
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
        io.to(data.toString()).emit("sendNoti", JSON.stringify(result));
      })
    );
    await Promise.all(
      JSON.parse(req.body.removedTags).map(async (data) => {
        await notificationManager.removeNotification(
          req.body.postId,
          req.user._id,
          data,
          "TAG"
        );
      })
    );
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
    await commentManager.deleteCommentByPost(req.body.postId);
    await notificationManager.removeNotificationByPost(req.body.postId);
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

router.post("/like", upload.none(), async (req, res) => {
  try {
    const io = req.app.get("io");
    const isLike = JSON.parse(req.body.isLike);
    const receiverId = req.body.receiverId;
    await postManager.likePost(req.body.postId, req.body.likeList, isLike);
    if (req.user._id.toString() !== req.body.receiverId) {
      if (isLike) {
        const notification = new Notification.Builder()
          .setDateOfCreation(new Date())
          .setPostId(req.body.postId)
          .setReceiverId(receiverId)
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
        io.to(receiverId.toString()).emit("sendNoti", JSON.stringify(result));
      } else {
        await notificationManager.removeNotification(
          req.body.postId,
          req.user._id,
          req.body.receiverId,
          req.body.type
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
        "Ooops something went wrong in the server, please try again later",
    });
  }
});

router.post("/getPostByUser", upload.none(), async (req, res) => {
  try {
    let docs = await postManager.getPostByUser(
      req.body.userId,
      req.user.friendList,
      req.user._id
    );
    docs = await Promise.all(
      docs.map(async (data) => {
        const newList = [];
        await Promise.all(
          data.likeList.map(async (id) => {
            if (id.toString() !== req.user._id.toString()) {
              const doc = await userManager.getUsernameAndImage(id);
              newList.push({
                nickname: doc.nickname,
                id: id,
                image: doc.profileImage,
              });
            } else newList.push({ id: id });
          })
        );
        return { ...data._doc, likers: newList };
      })
    );
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: docs,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something went wrong in the server, please try again later",
    });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    let doc = await postManager.getPostById(req.params.postId);
    if (doc === null) {
      res.send({
        message: null,
      });
      return;
    }
    doc = { ...doc._doc };
    if (req.user._id.toString() !== doc.userId.toString()) {
      const data = await userManager.getUsernameAndImage(doc.userId);
      doc = { ...doc, nickname: data.nickname, image: data.profileImage };
    }
    const liker = [];
    await Promise.all(
      doc.likeList.map(async (id) => {
        if (req.user._id.toString() !== id.toString()) {
          const file = await userManager.getUsernameAndImage(id);
          liker.push({
            id: id,
            nickname: file.nickname,
            image: file.profileImage,
          });
        } else {
          liker.push({ id: id });
        }
      })
    );
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: { ...doc, likers: liker },
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something went wrong in the server, please try again later",
    });
  }
});
module.exports = router;
