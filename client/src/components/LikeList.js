import "../css/likeList.css";
import Liker from "./Liker";
import CloseIcon from "@mui/icons-material/Close";
import { useLayoutEffect, useState } from "react";
import axios from "axios";

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
    post.tagDetails === undefined ? [...post.tags] : [...post.tagDetails]
  );
  useLayoutEffect(() => {
    const ac = new AbortController();
    async function updateComponent() {
      const temp = [];
      await Promise.all(
        (isTag ? tagList : likeList).map(async (data) => {
          if (data.nickname === undefined) {
            const formdata = new FormData();
            formdata.append("userId", data);
            await axios
              .post("/user/nameAndImage", formdata)
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                console.log(res);
                if (res.statusCode === 200) {
                  temp.push({
                    id: data,
                    nickname: res.message.nickname,
                    profile: res.message.profileImage,
                  });
                } else {
                  alert(res.message);
                }
              });
          }
        })
      );
      if (isTag) {
        post.tagDetails = [...temp];
        setTagList([...temp]);
      } else {
        setLikeList([...temp]);
      }
    }
    if (
      isTag
        ? tagList[0].nickname === undefined
        : likeList[0].nickname === undefined
    ) {
      updateComponent();
    }

    return function cancel() {
      ac.abort();
    };
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
        {(isTag ? tagList : likeList).map((liker, index) => {
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
        })}
      </div>
    </div>
  );
}
