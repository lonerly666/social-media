require("dotenv").config({ path: __dirname + "/../.env" });
const Grid = require("gridfs-stream");
const User = require("../entities/User");
const FriendRequest = require("../entities/FriendReq");
const userManager = require("../dbmangers/UserManager");
const postManager = require("../dbmangers/PostManager");
const mongoose = require("mongoose");
const friendReqManager = require("../dbmangers/FriendReqManager");
const router = require("express").Router();
const statusCodes = require("../statusCodes");
const multer = require("multer");
const methodOverride = require("method-override");
const mongoURI = process.env.DBURL;
const conn = mongoose.createConnection(mongoURI);
const storage = require("../filestorage/fileStorage");
const upload = multer({ storage: storage });
let gfs, gridfsBucket;
conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "profile",
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("profile");
});

router.post("/info", upload.array("profiles"), async (req, res) => {
  console.log(req.files);
  const url = {
    medium:`/user/profile/${req.user._id}medium`,
    original:`/user/profile/${req.user._id}original`
  }
  // const user = new User.Builder()
  //   .setNickname(req.body.nickname)
  //   .setBio(req.body.bio)
  //   .setGender(req.body.gender)
  //   .setDateOfBirth(req.body.dateOfBirth)
  //   .setImageDetails(JSON.parse(req.body.imageDetails))
  //   .setProfileImage(url)
  //   .build();
  // try {
  //   await userManager.saveUserInfo(user, req.user._id);
  //   res.send({
  //     statusCode: statusCodes.OK_STATUS_CODE,
  //     message: "/",
  //   });
  // } catch (err) {
  //   console.log(err);
  //   res.send({
  //     statusCode: statusCodes.ERR_STATUS_CODE,
  //     message: err,
  //   });
  // }
});

router.delete("/", upload.none(), async (req, res) => {
  try {
    await userManager.deleteUser(req.user._id);
    res.send({
      statusCode: statusCodes.OK_STATUS_CODE,
      message: "Successfully deleted your account!",
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message: err,
    });
  }
});

router.get("/profile/:id", upload.none(), async (req, res) => {
  try {
    gfs.files.findOne({filename:req.params.id},(err,file)=>{
      const readsStream = gridfsBucket.openDownloadStream(file._id);
      res.setHeader("Content-Type", file.contentType);
      res.setHeader("Content-Length", file.length);
      readsStream.pipe(res);
    })

    // var readStream = createReadStream([new Uint8Array(doc)]);
    // readStream.on('data', chunk => {
    //   console.log('---------------------------------');
    //   console.log(chunk);
    //   console.log('---------------------------------');
    // });;
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});

router.get("/friendRequests", upload.none(), async (req, res) => {
  try {
    let docs = await friendReqManager.getFriendRequests(req.user._id);
    docs = await Promise.all(
      docs.map(async (data) => {
        if (req.user._id.toString() !== data.senderId.toString()) {
          const doc = await userManager.getUsernameAndImage(data.senderId);
          let nickname = doc.nickname;
          let image = doc.profileImage;
          return { ...data._doc, nickname: nickname, image: image };
        }
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
        "Ooops something's wrong with the server, please try again later.",
    });
  }
});
router.delete("/profile", (req, res) => {
  gfs.files.find({ metadata: req.user._id }).toArray((err, file) => {
    // Check if file
    for (let i = 0; i < file.length; i++) {
      gridfsBucket.delete(file[i]._id, (err, gridStore) => {
        if (err) {
          return res.send({
            statusCode: statusCodes.ERR_STATUS_CODE,
            message: err,
          });
        }
      });
    }
  });
  res.end();
});
router.get("/:userId", upload.none(), async (req, res) => {
  try {
    const doc = await userManager.getUser(req.params.userId);
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

router.get("/single/:userId", upload.none(), async (req, res) => {
  try {
    const doc = await userManager.getUsernameAndImage(req.params.userId);
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

router.post("/multiple", upload.none(), async (req, res) => {
  try {
    const doc = await userManager.getMultipleUsernameAndImage(
      JSON.parse(req.body.userList)
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
      const result = {
        ...doc._doc,
        nickname: req.user.nickname,
        image: req.user.profileImage,
      };
      io.to(req.body.receiverId).emit("newFR", JSON.stringify(result));
      res.send({
        statusCode: statusCodes.SUCCESS_STATUS_CODE,
        message: "",
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

router.delete("/remove", upload.none(), async (req, res) => {
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

router.get("/requestStatus/:userId", upload.none(), async (req, res) => {
  try {
    const doc = await friendReqManager.getCurrentPending(
      req.user._id,
      req.params.userId
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

router.post("/search", upload.none(), async (req, res) => {
  try {
    if (req.body.char.trim() !== "" && req.body.char.length > 0) {
      const doc = await userManager.getUserByChar(req.body.char);
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
        message: doc,
      });
    } else {
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

router.post("/tag", upload.none(), async (req, res) => {
  try {
    if (req.body.char.trim() !== "" && req.body.char.length > 0) {
      const docs = await userManager.getUserByFriendList(
        req.body.char,
        req.user.friendList
      );
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
        message: docs,
      });
    } else {
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
        message: false,
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
