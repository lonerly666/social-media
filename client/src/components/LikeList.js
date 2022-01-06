import axios from "axios";
import { useEffect, useState } from "react";
import "../css/likeList.css";
import Liker from "./Liker";
import CloseIcon from "@mui/icons-material/Close";

export default function LikeList(props) {
  const { likeList, Avatar,setShowLike } = props;
  return (
    <div className="like-list-div">
      <div className="likers-option-div">
        <h3> Liked Users</h3>
        <button className="close-like-btn" onClick={()=>setShowLike(false)}>
          <CloseIcon />
        </button>
      </div>
      <div className="like-scrollable-div">
        {likeList.map((liker) => {
          return <Liker liker={liker} Avatar={Avatar} key={liker.id}/>;
        })}
      </div>
    </div>
  );
}
