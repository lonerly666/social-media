import axios from "axios";
import { useEffect, useState } from "react";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import LikeList from "./LikeList";

export default function Comment(props) {
  const {
    comment,
    Avatar,
    profile,
    user,
    totalComment,
    setTotalComment,
    setCommentList,
    post,
    commentList,
    Dialog
  } = props;
  const [userUrl, setUserUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [textEdit, setText] = useState("");
  const [like, setLike] = useState(false);
  const [likeList, setLikeList] = useState([]);
  const [showLike, setShowLike] = useState(false);
  useEffect(() => {
    if (comment.likeList.filter((data) => data.id === user._id).length > 0)
      setLike(true);
    setLikeList(comment.likeList);
    if (comment.creatorId !== user._id)
      axios
        .post("/user/profileImage/" + comment.creatorId)
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200)
            setUserUrl(
              URL.createObjectURL(new Blob([new Uint8Array(res.message.data)]))
            );
          else alert(res.message);
        });
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
              temp.push(res.message);
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
    formdata.set("totalComment", totalComment - 1);
    formdata.set("commentId", comment._id);
    formdata.set("postId", post._id);
    await axios({
      method: "DELETE",
      url: "/comment/delete",
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
    let temp = [...likeList];
    if (like) {
      setLikeList((prevData) => {
        return [
          ...prevData.filter((data) => {
            return data.id !== user._id;
          }),
        ];
      });
      temp = temp.filter((data) => {
        return data.id !== user._id;
      });
    } else {
      setLikeList((prevData) => {
        return [...prevData, { id: user._id, name: user.nickname }];
      });
      temp.push({ id: user._id, name: user.nickname });
    }
    const formdata = new FormData();
    formdata.set("commentId", comment._id);
    formdata.set("likeList", JSON.stringify(temp));
    await axios({
      method: "POST",
      url: "/comment/like",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          console.log(res);
        } else {
          alert(res.message);
        }
      });
  }
  return (
    <div className="comment-list-div">
      <div className="comment-avatar-div">
        <Avatar
          src={comment.creatorId === user._id ? profile : userUrl}
          style={{ position: "absolute", top: "0", left: "0" }}
        />
      </div>
      <div className="comment-text-div">
        <div style={{position:"relative"}}>
          <p className="commenters-name">{comment.creator}</p>
          {isEdit ? (
            <TextareaAutosize
              value={textEdit}
              onChange={(e) => setText(e.target.value)}
              className="commenters"
              onKeyDown={keyPressed}
            />
          ) : (
            <p className="commenters">{comment.text}</p>
          )}
          {likeList.length > 0 && (
            <div className="comment-num-likes-div">
              <div className="comment-num-likes-icon-div">
                <ThumbUpAltIcon style={{ fontSize: "15px" }} />
              </div>
              <span className="num-likes" onClick={() => setShowLike(true)}>
                {likeList.length}
              </span>
            </div>
          )}
        </div>
        <div className="more-option-comment-div">
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
          {user._id === comment.creatorId && (
            <ClickAwayListener onClickAway={() => setOpen(false)}>
              <div>
                <button
                  className="comment"
                  onClick={() => {
                    setOpen(!open);
                  }}
                >
                  <MoreHorizIcon
                    style={{ fontSize: "30px", height: "100%", width: "100%" }}
                  />
                </button>
                {open ? (
                  <div className="more-option-btn-div">
                    <button
                      className="option-btn"
                      onClick={() => {
                        setText(comment.text);
                        setIsEdit(true);
                        setOpen(false);
                      }}
                    >
                      Edit Comment
                    </button>
                    <button className="option-btn" onClick={handleDelete}>
                      Delete Comment
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
