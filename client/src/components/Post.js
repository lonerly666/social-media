import axios from "axios";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/post.css";
import "../css/comment.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import LikeList from "./LikeList";
import Comment from "./Comment";
import types from "./NotificationType";
import TextareaAutosize from "@mui/material/TextareaAutosize";

export default function Post(props) {
  const {
    post,
    Avatar,
    Carousel,
    user,
    setIsOpen,
    setIsEdit,
    setPostData,
    setPosts,
    Dialog,
    imageUrl,
    rerun,
    setRerun,
    setPostElement,
  } = props;
  const [profile, setProfile] = useState("");
  const [nickname, setNickname] = useState("");
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [likeList, setLikeList] = useState([]);
  const [totalComment, setTotalComment] = useState(0);
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [showLike, setShowLike] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isTag, setIsTag] = useState(false);
  const [hasMoreComment, setHasMoreComment] = useState(true);
  const thumb = useRef();
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
    setLikeList([...post.likeList]);
    if (post.totalComments <= 10) setHasMoreComment(false);
    setTotalComment(post.totalComments);
    if (post.likeList.includes(user._id)) setLiked(true);
    axios
      .get("/user/single/" + post.userId)
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setProfile(
            URL.createObjectURL(
              new Blob([new Uint8Array(res.message.profileImage.data)])
            )
          );
          setNickname(res.message.nickname);
        } else {
          alert(res.message);
        }
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  useEffect(() => {
    const ac = new AbortController();
    if (showComment === true && !hasShown) {
      const formdata = new FormData();
      formdata.set("numOfSkip", 0);
      axios({
        method: "POST",
        url: "/comment/" + post._id,
        data: formdata,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then(async (res) => {
          if (res.statusCode === 200) {
            numOfSkip.current += res.numOfSkip;
            post.totalComments = res.message.length;
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
  function handleToggleEdit() {
    setIsOpen(true);
    setIsEdit(true);
    setPostData(post);
  }
  async function handleDeletePost() {
    const formdata = new FormData();
    formdata.set("postId", post._id);
    await axios({
      method: "DELETE",
      data: formdata,
      url: "/post/",
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setPosts((prevData) => {
            return prevData.filter((data) => {
              return data._id !== post._id;
            });
          });
        } else {
          alert(res.message);
        }
      });
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
          return data._id !== user._id;
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
            nickname: user.nickname,
            profile: user.profileImage,
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
    console.log(numOfSkip.current);
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

  return (
    <div className="post-div" ref={setPostElement}>
      <div className="post-header">
        <div className="post-avatar-holder-div">
          <NavLink
            to={"/" + post.userId}
            style={{ width: "100%", height: "100%" }}
            onClick={() => {
              setRerun(!rerun);
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
            }}
          >
            <Avatar
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              src={profile}
            />
          </NavLink>
        </div>
        <div className="post-details-div">
          <div className="post-details-name">
            <NavLink
              to={"/" + post.userId}
              className="post-name-link"
              onClick={() => {
                setRerun(!rerun);
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
              }}
            >
              {nickname}
            </NavLink>{" "}
            {post.feeling && (
              <span>
                &nbsp;• &nbsp;is feeling {post.feeling}&nbsp;
                {emojiMap[post.feeling]}
              </span>
            )}
          </div>
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
        {post.userId === user._id && (
          <ClickAwayListener onClickAway={() => setOpen(false)}>
            <div>
              <button
                className="post-more-btn"
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <MoreHorizIcon />
              </button>
              {open ? (
                <div className="more-option-div">
                  <button className="option-btn" onClick={handleToggleEdit}>
                    Edit
                  </button>
                  {user._id === post.userId && (
                    <button className="option-btn" onClick={handleDeletePost}>
                      Delete
                    </button>
                  )}
                  {/* <button className="option-btn" onClick={handleDeletePost}>
                  Block Post
                </button> */}
                </div>
              ) : null}
            </div>
          </ClickAwayListener>
        )}
      </div>
      <div className="post-desc-div">
        <p style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
          {post.desc}
        </p>
      </div>
      <div className="post-files-holder-div">
        <Carousel
          showArrows={true}
          swipeable={true}
          showStatus={false}
          infiniteLoop={true}
          autoPlay={false}
          showThumbs={false}
          emulateTouch={true}
          showIndicators={false}
        >
          {post.files.map((file) => {
            return (
              <div key={post._id} style={{ height: "40vh" }}>
                <img
                  src={URL.createObjectURL(
                    new Blob([new Uint8Array(file.data)])
                  )}
                />
              </div>
            );
          })}
        </Carousel>
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
          <div className="comments-div">
            <div className="comment-create-div">
              <div className="comment-profile-avatar-div">
                <Avatar src={imageUrl} id="comment-profile-avatar" />
              </div>
              <div style={{ width: "90%", marginLeft: "2.2%" }}>
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
                  profile={imageUrl}
                  setTotalComment={setTotalComment}
                  setCommentList={setCommentList}
                  post={post}
                  totalComment={totalComment}
                  commentList={commentList}
                  Dialog={Dialog}
                />
              );
            })}
            {hasMoreComment && (
              <b onClick={fetchMoreComment} className="load-comment-btn">
                Load More Comments
              </b>
            )}
          </div>
        )}
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
          setLikeList={setLikeList}
          Avatar={Avatar}
          setShowLike={setShowLike}
          profile={imageUrl}
          user={user}
          isTag={isTag}
          post={post}
        />
      </Dialog>
    </div>
  );
}
