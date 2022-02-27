import axios from "axios";
import { useLayoutEffect, useRef, useState } from "react";
import "../css/postInfo.css";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  Avatar,
  TextareaAutosize,
  Dialog,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import LikeList from "./LikeList";
import Comment from "./Comment";
import types from "./NotificationType";
import { NavLink } from "react-router-dom";
export default function PostInfo(props) {
  const { user, profile, postId, setShowPost } = props;

  const [loaded, setLoaded] = useState(false);
  const [post, setPost] = useState({
    tags: [],
  });
  const [currFile, setCurrFile] = useState("");
  const [postFiles, setPostFiles] = useState([]);
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeList, setLikeList] = useState([]);
  const [totalComment, setTotalComment] = useState(0);
  const [showLike, setShowLike] = useState(false);
  const [noPost, setNoPost] = useState(false);
  const [isTag, setIsTag] = useState(false);
  const [hasMoreComment, setHasMoreComment] = useState(true);
  const thumb = useRef();
  let fileIndex = useRef(0);
  const numOfSkip = useRef(0);
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
  useLayoutEffect(() => {
    const ac = new AbortController();
    reset();
    if (postId) {
      axios
        .get("/post/" + postId)
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then(async (res) => {
          if (res.statusCode === 200) {
            console.log(res.message);
            if (res.message.totalComments <= 10) setHasMoreComment(false);
            if (res.message.likeList.includes(user._id)) setLiked(true);
            setPost({ ...res.message });
            setTotalComment(res.message.totalComments);
            setLikeList(res.message.likeList);
            res.message.files.length > 0 &&
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
            const id = res.message.userId;
            await axios
              .get(`/user/single/${id}`)
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                if (res.statusCode === 200) {
                  console.log(res.message);
                  setPost((prevData) => {
                    return {
                      ...prevData,
                      nickname: res.message.nickname,
                      profileImage: res.message.profileImage,
                    };
                  });
                } else {
                  alert(res.message);
                }
              });
          } else if (res.message === null) {
            setNoPost(true);
          } else {
            alert(res.message);
          }
        });
      const formdata = new FormData();
      formdata.set("numOfSkip", 0);
      axios({
        method: "POST",
        url: "/comment/" + postId,
        data: formdata,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then(async (res) => {
          if (res.statusCode === 200) {
            numOfSkip.current += res.numOfSkip;
            setCommentList((prevData) => {
              return [...res.message, ...prevData];
            });
          } else {
            alert(res.message);
          }
        })
        .then(() => setLoaded(true));
    }

    return function cancel() {
      ac.abort();
    };
  }, [postId]);
  function reset() {
    setPost({ tags: [] });
    setLoaded(false);
    setPostFiles([]);
    fileIndex.current = 0;
    setCommentList([]);
    setNoPost(false);
  }
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
          return data._id ? data._id !== user._id : data !== user._id;
        });
      });
      setLiked(!liked);
      thumb.current.style.animationName = "none";
    } else {
      setLikeList((prev) => {
        return [
          ...prev,
          {
            _id: user._id,
            profileImage: user.profileImage,
            nickname: user.nickname,
          },
        ];
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
      url: "/comment/",
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
  async function fetchMoreComment() {
    const formdata = new FormData();
    formdata.set("numOfSkip", numOfSkip.current);
    axios
      .post("/comment/" + post._id, formdata)
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          if (res.message.length < 10) setHasMoreComment(false);
          numOfSkip.current += res.numOfSkip;
          setCommentList((prevData) => {
            return [...prevData, ...res.message];
          });
        } else {
          alert(res.message);
        }
      });
  }
  return loaded ? (
    noPost ? (
      <div className="no-post-div">
        <IconButton
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "black",
          }}
          onClick={() => setShowPost(false)}
        >
          <CloseIcon />
        </IconButton>
        <div className="no-post-title">
          <h2>Ooopss</h2>
        </div>
        <h3>
          <b>This post might be archived or deleted by the user</b>
        </h3>
      </div>
    ) : (
      <div
        className="post-info-div"
        style={{
          justifyContent: postFiles.length === 0 && "center",
          height: postFiles.length === 0 && "auto",
        }}
      >
        {postFiles.length === 0 && (
          <IconButton
            style={{
              position: "absolute",
              top: "0px",
              left: "0px",
              color: "black",
            }}
            onClick={() => setShowPost(false)}
          >
            <CloseIcon />
          </IconButton>
        )}
        <NavLink
          to={"/" + post.userId}
          style={{ width: "100%", height: "100%" }}
          id={post._id}
          onClick={() => setShowPost(false)}
          hidden
        />
        {postFiles.length > 0 && (
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
        )}
        <div
          className="post-info-details-div"
          style={{ overflow: postFiles.length === 0 && "hidden" }}
        >
          <div className="post-info-details-head">
            <div className="post-info-profile-img">
              <Avatar
                style={{ width: "100%", height: "100%" }}
                src={
                  post.userId === user._id
                    ? profile
                    : post.profileImage
                    ? URL.createObjectURL(
                        new Blob([new Uint8Array(post.profileImage.data)])
                      )
                    : ""
                }
                onClick={() => {
                  document.getElementById(post._id).click();
                  setShowPost(false);
                }}
              />
            </div>
            <div className="post-info-title">
              <strong
                onClick={() => {
                  document.getElementById(post._id).click();
                  setShowPost(false);
                }}
                style={{ cursor: "pointer" }}
              >
                {post.nickname}
              </strong>
              {post.feeling && (
                <span>
                  &nbsp;• &nbsp;is feeling {post.feeling}&nbsp;
                  {emojiMap[post.feeling]}
                </span>
              )}
              <div className="post-details-date">
                {formatDate(post.timeOfCreation)}
                <span>&nbsp;•&nbsp;{privacyMap[post.isPublic]}</span>
                {post.tags.length > 0 && (
                  <span>
                    &nbsp;| &nbsp; Tags:{" "}
                    <span
                      className="post-tag-number"
                      onClick={() => {
                        setIsTag(true);
                        setShowLike(true);
                      }}
                    >
                      {post.tags.length}
                    </span>
                  </span>
                )}
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
                    <span
                      className="num-likes"
                      onClick={() => setShowLike(true)}
                    >
                      {likeList.length}
                    </span>
                  </div>
                )}
                {totalComment > 0 && (
                  <div className="total-comments-div">
                    <span className="total-comments">
                      {totalComment}
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
                <button className="post-option-btn" id="comment-btn">
                  <span className="like-emoji" title="💬">
                    💬
                  </span>
                  &nbsp;&nbsp;Comment
                </button>
              </div>
            </div>
            <div className="comments-div info">
              <div className="comment-create-div">
                <div className="comment-profile-avatar-div">
                  <Avatar src={profile} id="comment-profile-avatar" />
                </div>
                <div style={{ width: "85%", marginLeft: "2.2%" }}>
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
                    setShowPost={setShowPost}
                  />
                );
              })}
              {hasMoreComment && (
                <b onClick={fetchMoreComment} className="load-comment-btn">
                  Load More Comments
                </b>
              )}
            </div>
          </div>
        </div>

        <Dialog
          open={showLike}
          onClose={() => {
            setShowLike(false);
            setIsTag(false);
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
            setShowPost={setShowPost}
            isTag={isTag}
            setLikeList={setLikeList}
            post={post}
          />
        </Dialog>
      </div>
    )
  ) : (
    <div style={{ width: "100vw", height: "93vh", background: "white" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
        }}
      >
        <CircularProgress color="secondary" />
      </div>
    </div>
  );
}
