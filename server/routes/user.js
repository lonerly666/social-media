require("dotenv").config({ path: __dirname + "/../.env" });
const User = require("../entities/User");
const FriendRequest = require("../entities/FriendReq");
const userManager = require("../dbmangers/UserManager");
const postManager = require("../dbmangers/PostManager");
const friendReqManager = require("../dbmangers/FriendReqManager");
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const upload = multer();

router.post("/saveInfo", upload.any(), async (req, res) => {
  let cropped = undefined;
  let original = undefined;
  if (req.files) {
    await req.files.map((file) => {
      if (file.fieldname === "cropped") cropped = file.buffer;
      else original = file.buffer;
    });
  }
  const user = new User.Builder()
    .setNickname(req.body.nickname)
    .setBio(req.body.bio)
    .setGender(req.body.gender)
    .setDateOfBirth(req.body.dateOfBirth)
    .setProfileImage(cropped)
    .setOriginalImage(original)
    .setImagePosition(JSON.parse(req.body.coord))
    .setImageScale(req.body.scale)
    .build();
  try {
    if (req.body.oriName !== req.body.nickname)
      await postManager.updatePostUsername(req.user._id, req.body.nickname);
    await userManager.saveUserInfo(user, req.user._id);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: "/",
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
    await userManager.deleteUser(req.user._id);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: "Successfully delete your account!",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message: err,
    });
  }
});

router.post("/profileImage/:userId", upload.none(), async (req, res) => {
  try {
    const doc = await userManager.downloadUserImage(req.params.userId);

    // var readStream = createReadStream([new Uint8Array(doc)]);
    // readStream.on('data', chunk => {
    //   console.log('---------------------------------');
    //   console.log(chunk);
    //   console.log('---------------------------------');
    // });
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: doc,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/info", upload.none(), async (req, res) => {
  try {
    const doc = await userManager.getUser(req.body.userId);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: doc,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/nameAndImage", upload.none(), async (req, res) => {
  try {
    const doc = await userManager.getUsernameAndImage(req.body.userId);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: doc,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/send", upload.none(), async (req, res) => {
  try {
    const doc = await friendReqManager.checkRequestExisted(
      req.user._id,
      req.body.receiverId
    );
    if (doc) {
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
        message: doc,
      });
    } else {
      const io = req.app.get("io");
      const friendRequest = new FriendRequest.Builder()
        .setSenderId(req.user._id)
        .setReceiverId(req.body.receiverId)
        .setDateOfCreation(new Date())
        .build();
      const doc = await friendReqManager.sendFriendReq(friendRequest);
      io.to(req.body.receiverId).emit("newFR", doc);
      res.send({
        statusCode: statusCodes.SUCCESS_STATUS_CODE,
        message: doc,
      });
    }
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/unsend", upload.none(), async (req, res) => {
  try {
    const doc = await userManager.checkFriendList(
      req.user._id,
      req.body.receiverId
    );
    if (doc) {
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
        message: "friend",
      });
    } else {
      await friendReqManager.unsendFriendRequest(
        req.user._id,
        req.body.receiverId
      );
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
      });
    }
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/decline", upload.none(), async (req, res) => {
  try {
    const doc = await friendReqManager.removeFriendRequest(req.body.reqId);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: doc,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/accept", upload.none(), async (req, res) => {
  try {
    const doc = await friendReqManager.checkRequestExisted(
      req.user._id,
      req.body.friendId
    );
    if (doc === null) {
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
        message: "unsent",
      });
    } else {
      await friendReqManager.removeFriendRequest(req.body.reqId);
      await userManager.updateFriendList(req.user._id, req.body.friendId, true);
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
      });
    }
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/remove", upload.none(), async (req, res) => {
  try {
    await userManager.updateFriendList(
      req.user._id,
      req.body.receiverId,
      false
    );
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/getFriendRequests", upload.none(), async (req, res) => {
  try {
    const docs = await friendReqManager.getFriendRequests(req.user._id);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: docs,
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/getRequestStatus", upload.none(), async (req, res) => {
  try {
    const doc = await friendReqManager.getCurrentPending(
      req.user._id,
      req.body.userId
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
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.post("/getAllUser", upload.none(), async (req, res) => {
  try {
    if (req.body.char.trim()!==""&&req.body.char.length>0) {
      const doc = await userManager.getUserByChar(req.body.char);
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
        message: doc,
      });
    }
    else{
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
        message: [],
      });
    }
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});
module.exports = router;
