require("dotenv").config({ path: __dirname + "/../.env" });
const User = require("../entities/User");
const userManager = require("../dbmangers/UserManager");
const postManager = require("../dbmangers/PostManager");
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const upload = multer();
const fs = require("fs");

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

router.post("/username",upload.none(),async(req,res)=>{
  try{
    const doc = await userManager.getUsername(req.body.userId);
    res.send({
      statusCode:statusCodes.OK_STATUS_CODE,
      message:doc
    });
  }
  catch(err){
    console.log(err);
    res.send({
      statusCode:statusCodes.ERR_STATUS_CODE,
      message:  "Ooops something's wrong with the server, please try again later.",
    });
  }
});

module.exports = router;
