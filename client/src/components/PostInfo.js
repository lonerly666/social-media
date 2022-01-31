import axios from "axios";
import { useEffect, useRef, useState } from "react";
import "../css/postInfo.css";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Avatar, TextareaAutosize, Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import LikeList from "./LikeList";
import Comment from "./Comment";
import types from "./NotificationType";
export default function PostInfo(props) {
  const { user, profile, postId, setShowPost } = props;

  const [filePage, setFilePage] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [post, setPost] = useState({});
  const [currFile, setCurrFile] = useState("");
  const [postFiles, setPostFiles] = useState([]);
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [likeList, setLikeList] = useState([]);
  const [totalComment, setTotalComment] = useState(0);
  const [showLike, setShowLike] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const thumb = useRef();
  let fileIndex = useRef(0);
  const emojiMap = {
    happy: "😀",
    sad: "☹️",
    surprised: "😮",
    meh: "😕",
    annoyed: "🙄",
    sleepy: "😴",
    loved: "🥰",
    touched: "😭",
    shy: "😌",
    amazed: "🤩",
  };
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const privacyMap = {
    0: "🔒",
    1: "🌎",
    2: "👩🏻‍🤝‍🧑🏻",
  };
  useEffect(async () => {
    const ac = new AbortController();
    if (postId) {
      axios
        .get("/post/" + postId)
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            setPost(res.message);
            setTotalComment(res.message.totalComments);
            setLikeList(res.message.likers);
            setCurrFile(
              URL.createObjectURL(
                new Blob([new Uint8Array(res.message.files[0].data)])
              )
            );
            res.message.files.map((file) => {
              setPostFiles((prevData) => {
                return [
                  ...prevData,
                  URL.createObjectURL(new Blob([new Uint8Array(file.data)])),
                ];
              });
            });
          } else {
            alert(res.message);
          }
        })
        .then(() => {
          setLoaded(true);
        });
    }

    return function cancel() {
      ac.abort();
    };
  }, [postId]);
  useEffect(() => {
    const ac = new AbortController();
    if (showComment === true && !hasShown) {
      const formdata = new FormData();
      formdata.set("postId", postId);
      axios({
        method: "POST",
        data: formdata,
        url: "/comment/all",
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then(async (res) => {
          if (res.statusCode === 200) {
            setCommentList((prevData) => {
              return [...res.message, ...prevData];
            });
            setHasShown(true);
          } else {
            alert(res.message);
          }
        });
    }
    return function cancel() {
      ac.abort();
    };
  }, [showComment]);
  function rotateImage(arrow) {
    if (arrow === "left") {
      fileIndex.current--;
      if (fileIndex.current < 0) {
        fileIndex.current = postFiles.length - 1;
      }
    } else {
      fileIndex.current++;
      if (fileIndex.current > postFiles.length - 1) {
        fileIndex.current = 0;
      }
    }
    setFilePage(fileIndex.current);
    setCurrFile(postFiles[fileIndex.current]);
  }
  function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }
  function formatDate(date) {
    const today = new Date();
    const commentDate = new Date(parseInt(Date.parse(date), 10));
    let diffInDay = dateDiffInDays(commentDate, today);
    if (diffInDay === 0) {
      return "today";
    } else {
      if (diffInDay >= 7) {
        return `${Math.floor(diffInDay / 7)} w`;
      } else {
        return `${diffInDay} d`;
      }
    }
  }
  async function handleToggleLike() {
    const formdata = new FormData();
    if (liked) {
      setLikeList((prev) => {
        return prev.filter((data) => {
          return data.id !== user._id;
        });
      });
      setLiked(!liked);
      thumb.current.style.animationName = "none";
    } else {
      setLikeList((prev) => {
        return [...prev, { id: user._id }];
      });
      setLiked(!liked);
      thumb.current.style.animation = "move .3s linear";
    }
    formdata.set("likeList", user._id);
    formdata.set("postId", post._id);
    formdata.set("isLike", liked ? false : true);
    formdata.set("type", types.LIKE_POST);
    formdata.set("receiverId", post.userId);
    await axios({
      method: "POST",
      url: "/post/like",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 400) {
          setLiked(false);
        }
      });
  }
  async function handleComment() {
    const formdata = new FormData();
    formdata.set("postId", post._id);
    formdata.set("text", comment);
    formdata.set("receiverId", post.userId);
    formdata.set("type", types.COMMENT);
    await axios({
      method: "POST",
      data: formdata,
      url: "/comment/create",
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 201) {
          setTotalComment((prevData) => {
            return prevData + 1;
          });
          setCommentList((prevData) => {
            return [...prevData, res.message];
          });
          setComment("");
        } else {
          alert(res.message);
        }
      });
  }
  function keyPressed(event) {
    if (event.which === 13 && !event.shiftKey) {
      handleComment();
      event.preventDefault();
    }
  }
  return loaded ? (
    <div className="post-info-div">
      <div
        className="post-info-images-div"
        onMouseOver={() => {
          if (postFiles.length > 1) {
            document.getElementById("right").style.display = "block";
            document.getElementById("left").style.display = "block";
          }
        }}
        onMouseLeave={() => {
          document.getElementById("right").style.display = "none";
          document.getElementById("left").style.display = "none";
        }}
      >
        <IconButton
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "whitesmoke",
          }}
          onClick={() => setShowPost(false)}
        >
          <CloseIcon />
        </IconButton>
        <button
          onClick={() => rotateImage("right")}
          className="img-rotate-btn right"
          id="right"
        >
          <ArrowForwardIosIcon />
        </button>
        <button
          onClick={() => rotateImage("left")}
          className="img-rotate-btn left"
          id="left"
        >
          <ArrowBackIosNewIcon />
        </button>
        <img
          src={currFile}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
      <div className="post-info-details-div">
        <div className="post-info-details-head">
          <div className="post-info-profile-img">
            <Avatar
              style={{ width: "100%", height: "100%" }}
              src={
                post.userId === user._id
                  ? profile
                  : URL.createObjectURL(
                      new Blob([new Uint8Array(post.image.data)])
                    )
              }
            />
          </div>
          <div className="post-info-title">
            <strong>{post.nickname}</strong>
            {post.feeling && (
              <span>
                &nbsp;• &nbsp;is feeling {post.feeling}&nbsp;
                {emojiMap[post.feeling]}
              </span>
            )}
            <div className="post-details-date">
              {formatDate(post.timeOfCreation)}
              <span>&nbsp;•&nbsp;{privacyMap[post.isPublic]}</span>
            </div>
          </div>
        </div>
        <div className="post-desc-div">
          <p>{post.desc}</p>
        </div>
        <div className="post-padding-div">
          {(likeList.length >= 1 || totalComment > 0) && (
            <div className="post-details-list">
              {likeList.length > 0 && (
                <div className="num-likes-div">
                  <div className="num-likes-icon-div">
                    <ThumbUpAltIcon style={{ fontSize: "15px" }} />
                  </div>
                  <span className="num-likes" onClick={() => setShowLike(true)}>
                    {likeList.length}
                  </span>
                </div>
              )}
              {totalComment > 0 && (
                <div className="total-comments-div">
                  <span
                    className="total-comments"
                    onClick={() => setShowComment(!showComment)}
                  >
                    {commentList.length}
                    {totalComment > 1 ? " comments" : " comment"}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="post-option-div">
            <div className="like-div">
              <button
                className="post-option-btn"
                id="like-btn"
                onClick={handleToggleLike}
                style={{ color: liked && "rgb(45, 158, 102)" }}
              >
                <span
                  className="like-emoji"
                  title="👍"
                  id="like"
                  style={{
                    color: liked && "rgb(45, 158, 102)",
                    fontWeight: "600",
                  }}
                  ref={thumb}
                >
                  {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                </span>
                &nbsp;&nbsp;Like
              </button>
            </div>
            <div className="comment-div">
              <button
                className="post-option-btn"
                id="comment-btn"
                onClick={() => setShowComment(!showComment)}
              >
                <span className="like-emoji" title="💬">
                  💬
                </span>
                &nbsp;&nbsp;Comment
              </button>
            </div>
          </div>
          {showComment && (
            <div className="comments-div info">
              <div className="comment-create-div">
                <div className="comment-profile-avatar-div">
                  <Avatar src={profile} id="comment-profile-avatar" />
                </div>
                <TextareaAutosize
                  className="comment-create-text create"
                  placeholder="write a comment..."
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                  onKeyDown={keyPressed}
                />
              </div>
              {commentList.map((comment) => {
                return (
                  <Comment
                    key={comment._id}
                    comment={comment}
                    Avatar={Avatar}
                    user={user}
                    profile={profile}
                    setTotalComment={setTotalComment}
                    setCommentList={setCommentList}
                    post={post}
                    totalComment={totalComment}
                    commentList={commentList}
                    Dialog={Dialog}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showLike}
        onClose={() => {
          setShowLike(false);
        }}
        transitionDuration={0}
        maxWidth="100vw"
        PaperProps={{
          style: {
            borderRadius: "20px",
            width: "30vw",
            height: "50vh",
            padding: "none",
          },
        }}
      >
        <LikeList
          likeList={likeList}
          Avatar={Avatar}
          setShowLike={setShowLike}
          profile={profile}
          user={user}
        />
      </Dialog>
    </div>
  ) : (
    <div></div>
  );
}
