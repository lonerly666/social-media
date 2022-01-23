import "../css/likeList.css";
import Liker from "./Liker";
import CloseIcon from "@mui/icons-material/Close";

export default function LikeList(props) {
  const { likeList, Avatar,setShowLike,profile,user } = props;
  return (
    <div className="like-list-div">
      <div className="likers-option-div">
        <h3> Likes</h3>
        <button className="close-like-btn" onClick={()=>setShowLike(false)}>
          <CloseIcon />
        </button>
      </div>
      <div className="like-scrollable-div">
        {likeList.map((liker,index) => {
          return <Liker liker={liker} Avatar={Avatar} key={index} profile={profile} user={user}/>;
        })}
      </div>
    </div>
  );
}
