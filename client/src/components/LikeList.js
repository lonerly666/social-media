import "../css/likeList.css";
import Liker from "./Liker";
import CloseIcon from "@mui/icons-material/Close";
import { useLayoutEffect, useState } from "react";
import axios from "axios";
import Skeleton from "@mui/material/Skeleton";

export default function LikeList(props) {
  const {
    likeList,
    setLikeList,
    Avatar,
    setShowLike,
    profile,
    user,
    setShowPost,
    isTag,
    post,
  } = props;
  const [tagList, setTagList] = useState(
    isTag
      ? post.tagDetails === undefined
        ? [...post.tags]
        : [...post.tagDetails]
      : []
  );
  const [isLoading, setIsLoading] = useState(false);
  useLayoutEffect(() => {
    const ac = new AbortController();
    if (
      isTag ? post.tagDetails === undefined : likeList[0].nickname === undefined
    ) {
      setIsLoading(true);
      const formdata = new FormData();
      formdata.append(
        "userList",
        isTag ? JSON.stringify(post.tags) : JSON.stringify(likeList)
      );
      axios
        .post("/user/multiple", formdata)
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            if (isTag) {
              post.tagDetails = [...res.message];
              setTagList([...res.message]);
            } else {
              setLikeList([...res.message]);
            }
            setIsLoading(false);
          } else {
            alert(res.message);
          }
        });
    }
    return function cancel() {
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="like-list-div">
      <div className="likers-option-div">
        <h3>{isTag ? "Tags" : "Likes"}</h3>
        <button className="close-like-btn" onClick={() => setShowLike(false)}>
          <CloseIcon />
        </button>
      </div>
      <div className="like-scrollable-div">
        {isLoading ? (
          <div>
            <div className="list-skeleton">
              <Skeleton
                variant="circular"
                width={50}
                height={50}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={100}
                height={30}
                animation="wave"
              />
            </div>
            <div className="list-skeleton">
              <Skeleton
                variant="circular"
                width={50}
                height={50}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={100}
                height={30}
                animation="wave"
              />
            </div>
          </div>
        ) : (
          (isTag ? tagList : likeList).map((liker, index) => {
            return (
              <Liker
                liker={liker}
                Avatar={Avatar}
                key={index}
                profile={profile}
                user={user}
                setShowPost={setShowPost}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
