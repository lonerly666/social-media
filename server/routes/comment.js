require("dotenv").config({ path: __dirname + "/../.env" });
const Comment = require("../entities/Comment");
const commentManager = require("../dbmangers/CommentManager");
const postManager = require("../dbmangers/PostManager");
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const statusCodes = require("../statusCodes");
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const multer = require("multer");
const upload = multer();

router.post("/create", upload.any(), async (req, res) => {
  const comment = new Comment.Builder()
    .setCreator(req.user.nickname)
    .setCreatorId(req.user._id)
    .setPostId(req.body.postId)
    .setText(req.body.text)
    .setDateOfCreation(new Date())
    .build();
  try {
    const doc = await commentManager.createComment(comment);
    await postManager.updateTotalComment(
      req.body.postId,
      JSON.parse(req.body.totalComment)
    );
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

router.delete('/delete',upload.none(),async(req,res)=>{
    try{
        await commentManager.deleteComment(req.body.commentId);
        await postManager.updateTotalComment(req.body.postId,(JSON.parse(req.body.totalComment)));
        res.send({
            statusCode:statusCodes.OK_STATUS_CODE
        });
    }
    catch(err){
        console.log(err);
        res.send({
            statusCode:statusCodes.ERR_STATUS_CODE,
            message:"Ooopss something went wrong with the server, please try again later"
        })
    }
})

module.exports = router;
