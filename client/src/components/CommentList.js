import "../css/comment.css";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Comment from "./Comment";

export default function CommentList(props) {
  const { post, user, Avatar, profile, setTotalComment, totalComment, Dialog } =
    props;
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);
  useEffect(() => {
    const ac = new AbortController();
    const formdata = new FormData();
    formdata.set("postId", post._id);
    axios({
      method: "POST",
      data: formdata,
      url: "/comment/all",
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) setCommentList([...res.message]);
        else {
          alert(res.message);
        }
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  async function handleComment(e) {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("postId", post._id);
    formdata.append("text", comment);
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
            return [res.message, ...prevData];
          });
        }
      });
  }
  function keyPressed(event) {
    if (event.which === 13 && !event.shiftKey) {
      document.getElementById("go").click();
      event.target.value = "";
      event.preventDefault();
    }
  }
  return (
    <div className="comments-div">
      <form onSubmit={handleComment}>
        <div className="comment-create-div">
          <div className="comment-profile-avatar-div">
            <Avatar src={profile} id="comment-profile-avatar" />
          </div>
          <TextareaAutosize
            className="comment-create-text create"
            placeholder="write a comment..."
            onChange={(e) => {
              setComment(e.target.value);
            }}
            onKeyDown={keyPressed}
          />
        </div>
        <input type="submit" id="go" hidden />
      </form>
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
  );
}
