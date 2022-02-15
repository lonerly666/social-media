import "../css/likeList.css";
import Liker from "./Liker";
import CloseIcon from "@mui/icons-material/Close";

export default function LikeList(props) {
  const {
    likeList,
    Avatar,
    setShowLike,
    profile,
    user,
    setShowPost,
    isTag,
    tagList,
  } = props;
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
