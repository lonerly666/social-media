import axios from "axios";
import { useEffect, useState } from "react";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

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
    setComment
  } = props;
  const [userUrl, setUserUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [isEdit,setIsEdit] = useState(false);
  useEffect(() => {
    if (comment.creatorId === user._id)
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
      setComment(comment.text);
      setIsEdit(true);
  }
  async function handleDelete() {
    const formdata = new FormData();
    formdata.set("totalComment", totalComment - 1);
    formdata.set("commentId", comment._id);
    formdata.set("postId",post._id);
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
  return (
    <div className="comment-list-div">
      <div className="comment-avatar-div">
        <Avatar
          src={comment.creatorId === user._id ? profile : userUrl}
          style={{ position: "absolute", top: "0", left: "0" }}
        />
      </div>
      <div className="comment-text-div">
        <p className="commenters-name">{comment.creator}</p>
        {isEdit?<TextareaAutosize value={comment.text} onChange={(e)=>setComment(e.target.value)}/>:<p className="commenters">{comment.text}</p>}
        <div className="more-option-comment-div">
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
                    style={{ fontSize: "20px", height: "100%", width: "100%" }}
                  />
                </button>
                {open ? (
                  <div className="more-option-btn-div">
                    <button className="option-btn" onClick={handleEdit}>
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
    </div>
  );
}
