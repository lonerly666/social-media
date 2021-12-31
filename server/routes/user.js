require("dotenv").config({ path: __dirname + "/../.env" });
const User = require("../entities/User");
const userManager = require("../dbmangers/UserManager");
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const upload = multer();

router.post("/saveInfo",upload.single('img'),async (req, res) => {
  const user = new User.Builder()
    .setNickname(req.body.nickname)
    .setBio(req.body.bio)
    .setGender(req.body.gender)
    .setDateOfBirth(req.body.dateOfBirth)
    .setProfileImage(req.file?req.file.buffer:req.body.buffer.data)
    .build();
  try {
    await userManager.saveUserInfo(user, req.user._id);
    res.send({
      statusCode:statusCodes.OK_STATUS_CODE,
      message: "/",
    })
  } catch (err) {
    console.log(err);
    res.send({
      statusCode: statusCodes.ERR_STATUS_CODE,
      message: err,
    });
  }
});

module.exports = router;
