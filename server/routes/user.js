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
    .build();
  try {
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

module.exports = router;
