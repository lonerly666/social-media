import axios from "axios";
import { useEffect, useRef, useState } from "react";
import "../css/post.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import LikeList from "./LikeList";
import CommentList from "./CommentList";

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
  } = props;
  const [profile, setProfile] = useState("");
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [likeList, setLikeList] = useState([]);
  const [totalComment, setTotalComment] = useState(0);
  const [showLike, setShowLike] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const thumb = useRef();
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
  useEffect(() => {
    const ac = new AbortController();
    setLikeList([...post.likeList]);
    setTotalComment(post.totalComments);
    if (post.likeList.filter((data) => data.id === user._id).length > 0)
      setLiked(true);
    axios
      .post("/user/profileImage/" + post.userId)
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        setProfile(
          URL.createObjectURL(new Blob([new Uint8Array(res.message.data)]))
        );
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  useEffect(() => {}, [showLike]);
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
      url: "/post/delete",
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
    let diffInDay  = dateDiffInDays(today,commentDate);
    if(diffInDay===0){
        return "today"
    }
    else{
        if(diffInDay>=7){
            return `${diffInDay/7} w`
        }
        else{
            return `${diffInDay} d`
        }
    }
  }
  async function handleToggleLike() {
    const formdata = new FormData();
    let tempList = [...likeList];
    if (liked) {
      setLikeList((prev) => {
        return prev.filter((data) => {
          return data.id !== user._id;
        });
      });
      tempList = tempList.filter((data) => {
        return data.id !== user._id;
      });
      setLiked(!liked);
      thumb.current.style.animationName = "none";
    } else {
      tempList.push({ id: user._id, name: user.nickname });
      setLikeList((prev) => {
        return [...prev, { id: user._id, name: user.nickname }];
      });
      setLiked(!liked);
      thumb.current.style.animation = "move .3s linear";
    }
    formdata.set("likeList", JSON.stringify(tempList));
    formdata.set("postId", post._id);
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
  return (
    <div className="post-div">
      <div className="post-header">
        <div className="post-avatar-holder-div">
          <Avatar style={{ width: "100%", height: "100%" }} src={profile} />
        </div>
        <div className="post-details-div">
          <div className="post-details-name">
            {post.nickname}{" "}
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
          </div>
        </div>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <div>
            <button
              className="post-more-btn"
              onClick={(e) => {
                setOpen(!open);
              }}
            >
              <MoreHorizIcon />
            </button>
            {open ? (
              <div className="more-option-div">
                <button className="option-btn" onClick={handleToggleEdit}>
                  Edit Post
                </button>
                {user._id === post.userId && (
                  <button className="option-btn" onClick={handleDeletePost}>
                    Delete Post
                  </button>
                )}
                {/* <button className="option-btn" onClick={handleDeletePost}>
                  Block Post
                </button> */}
              </div>
            ) : null}
          </div>
        </ClickAwayListener>
      </div>
      <div className="post-desc-div">
        <p>{post.desc}</p>
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
          <CommentList
            post={post}
            user={user}
            Avatar={Avatar}
            profile={profile}
            setTotalComment={setTotalComment}
            totalComment={totalComment}
            profile={profile}
            Dialog={Dialog}
          />
        )}
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
  );
}
