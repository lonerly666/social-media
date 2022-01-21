import "../css/comment.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Comment from "./Comment";

export default function CommentList(props) {
  const {
    post,
    user,
    Avatar,
    profile,
    setTotalComment,
    totalComment,
    Dialog,
    commentList,
    setCommentList,
  } = props;
  const [isLoading, setIsLoading] = useState(true);
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
        if (res.statusCode === 200) {
          setCommentList([...res.message]);
          setIsLoading(false);
        } else {
          alert(res.message);
        }
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  return isLoading ? (
    <div></div>
  ) : (
    <div>
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
