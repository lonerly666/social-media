import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import LikeList from "./LikeList";
import NotificationType from "./NotificationType";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const _MS_PER_DAY = 1000 * 60 * 60 * 24;
export default function Comment(props) {
  const {
    comment,
    Avatar,
    profile,
    user,
    setTotalComment,
    setCommentList,
    post,
    commentList,
    Dialog,
  } = props;
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [textEdit, setText] = useState("");
  const [like, setLike] = useState(false);
  const [likeList, setLikeList] = useState([]);
  const [showLike, setShowLike] = useState(false);
  useEffect(() => {
    const ac = new AbortController();
    if (comment.likeList.includes(user._id)) setLike(true);
    setLikeList(comment.likers);
    return function cancel() {
      ac.abort();
    };
  }, []);
  async function handleEdit() {
    const formdata = new FormData();
    formdata.set("commentId", comment._id);
    formdata.set("text", textEdit);
    await axios({
      method: "POST",
      data: formdata,
      url: "/comment/edit",
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          let temp = [];
          commentList.map((comment) => {
            if (comment._id === res.message._id) {
              temp.push({ ...res.message, likers: comment.likers });
            } else temp.push(comment);
          });
          setCommentList(temp);
          setIsEdit(false);
        } else {
          alert(res.message);
        }
      });
  }
  async function handleDelete() {
    const formdata = new FormData();
    formdata.set("commentId", comment._id);
    formdata.set("postId", post._id);
    formdata.set("receiverId", post.userId);
    formdata.set("type",NotificationType.COMMENT);
    await axios({
      method: "DELETE",
      url: "/comment/",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setTotalComment((prev) => {
            return prev - 1;
          });
          setCommentList((prev) => {
            return [
              ...prev.filter((data) => {
                return data._id !== comment._id;
              }),
            ];
          });
        }
      });
  }
  function keyPressed(event) {
    if (event.which === 13 && !event.shiftKey) {
      handleEdit();
      event.target.value = "";
      event.preventDefault();
    }
  }
  async function handleLikeComment() {
    if (like) {
      setLikeList((prevData) => {
        return [
          ...prevData.filter((data) => {
            return data.id !== user._id;
          }),
        ];
      });
    } else {
      setLikeList((prevData) => {
        return [...prevData, { id: user._id }];
      });
    }
    const formdata = new FormData();
    formdata.set("commentId", comment._id);
    formdata.set("likeList", user._id);
    formdata.set("isLike", like ? false : true);
    formdata.set("receiverId", comment.creatorId);
    formdata.set("postId", comment.postId);
    formdata.set("type", NotificationType.LIKE_COMMENT);
    await axios({
      method: "POST",
      url: "/comment/like",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 400) {
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
  return (
    <div className="comment-list-div">
      <div className="comment-avatar-div">
        <NavLink
          to={"/" + comment.creatorId}
          style={{ width: "100%", height: "100%" }}
        >
          <Avatar
            src={
              comment.creatorId === user._id
                ? profile
                : comment.image
                ? URL.createObjectURL(
                    new Blob([new Uint8Array(comment.image.data)])
                  )
                : ""
            }
            style={{ position: "absolute", top: "0", left: "0" }}
          />
        </NavLink>
      </div>
      <div className="comment-text-div">
        <div className="commenters-div">
          <NavLink
            to={"/" + comment.creatorId}
            style={{ textDecoration: "none", color: "black", padding: 0 }}
          >
            <p className="commenters-name">
              {comment.creatorId === user._id
                ? user.nickname
                : comment.nickname}
            </p>
          </NavLink>
          {isEdit ? (
            <TextareaAutosize
              value={textEdit}
              onChange={(e) => setText(e.target.value)}
              className="commenters-edit"
              onKeyDown={keyPressed}
              autoFocus
            />
          ) : (
            <p className="commenters">{comment.text}</p>
          )}
          {likeList.length > 0 && (
            <div className="comment-num-likes-div">
              <div className="comment-num-likes-icon-div">
                <ThumbUpAltIcon style={{ fontSize: "12px" }} />
              </div>
              <span
                className="num-likes"
                onClick={() => setShowLike(true)}
                style={{
                  fontSize: "12px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {likeList.length}
              </span>
            </div>
          )}
        </div>
        <div className="comment-date">
          <span>{formatDate(comment.dateOfCreation)}</span>
        </div>
      </div>
      <div className="more-option-comment-div">
        <div className="more-option-comment-btn-holder">
          {!isEdit && (
            <button
              className="comment"
              onClick={() => {
                setLike(!like);
                handleLikeComment();
              }}
            >
              <ThumbUpAltIcon
                style={{
                  fontSize: "30px",
                  height: "100%",
                  width: "100%",
                  color: like ? "green" : "gray",
                }}
              />
            </button>
          )}
          {user._id === comment.creatorId && (
            <ClickAwayListener onClickAway={() => setOpen(false)}>
              <div style={{ position: "relative" }}>
                {!isEdit && (
                  <button
                    className="comment"
                    onClick={() => {
                      setOpen(!open);
                    }}
                  >
                    <MoreHorizIcon
                      style={{
                        fontSize: "30px",
                        height: "100%",
                        width: "100%",
                      }}
                    />
                  </button>
                )}
                {open ? (
                  <div className="more-option-btn-div">
                    <button
                      className="option-btn cmnt"
                      onClick={() => {
                        setText(comment.text);
                        setIsEdit(true);
                        setOpen(false);
                      }}
                    >
                      <EditIcon/>
                    </button>
                    <button className="option-btn cmnt" onClick={handleDelete}>
                      <DeleteIcon/>
                    </button>
                    {/* <button className="option-btn" onClick={handleDeletePost}>
                  Block Post
                </button> */}
                  </div>
                ) : null}
              </div>
            </ClickAwayListener>
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
  );
}
