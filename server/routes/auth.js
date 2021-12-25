require("dotenv").config({ path: __dirname + "/../.env" });
const statusCodes = require('../statusCodes')
const router = require("express").Router();
const passport = require("passport");
const inProduction = process.env.NODE_ENV === "production";
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const UserManager = require("../dbmangers/UserManager");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/logout", (req, res) => {
  req.session.destroy();
  req.logout();
  res.redirect(CLIENT_URL);
});

router.get(
  "/google/social-media",
  passport.authenticate("google", {
    failureRedirect: CLIENT_URL,
    successRedirect: CLIENT_URL,
  })
);

router.get("/isLoggedIn", async (req, res) => {
  if (req.user) {
    try {
      const userInfo = await UserManager.getUser(req.user._id);
      if (userInfo.nickname === undefined)
        res.send({
          statusCode: statusCodes.OK_STATUS_CODE,
          message: '/form',
        });
      else
        res.send({
          statusCode: statusCodes.OK_STATUS_CODE,
          message: userInfo,
        });
    } catch (err) {
      res.send({
        statusCode: statusCodes.ERR_STATUS_CODE,
        message:
          "Oops, there is something wrong with the server please try again later :(",
      });
    }
  } else res.send({
    statusCode:statusCodes.OK_STATUS_CODE,
    message:'/login'
  })
});

module.exports = router;
