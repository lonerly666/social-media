require("dotenv").config({ path: __dirname + "/../.env" });
const notificationManager = require("../dbmangers/NotificationManager");
const userManager = require("../dbmangers/UserManager");
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const upload = multer();

router.post("/getAll", upload.none(), async (req, res) => {
  try {
    const result = [];
    const docs = await notificationManager.getAllNotification(req.user._id);
    await Promise.all(
      docs.map(async (data) => {
        await userManager.getUsernameAndImage(data.senderId).then((doc) => {
          let nickname = doc.nickname;
          let image = doc.profileImage;
          result.push({ ...data._doc, nickname: nickname, image: image });
        });
      })
    ).then(() => {
      res.send({
        statusCode: statusCodes.OK_STATUS_CODE,
        message: result,
      });
    });
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message:
        "Ooops there is something wrong with the server please try again later",
    });
  }
});

module.exports = router;
