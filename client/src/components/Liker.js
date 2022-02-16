import axios from "axios";
import { useLayoutEffect } from "react";
import { NavLink } from "react-router-dom";

export default function Liker(props) {
  const { Avatar, liker, profile, user,setShowPost } = props;
  useLayoutEffect(()=>{
    const ac = new AbortController();
    if(!liker.nickname){
      const formdata = new FormData();
      formdata.append('userId',liker.id);
      axios.post('/user/')
    }

    return function cancel(){
      ac.abort();
    }
  },[])
  return (
    <div className="liker-details-div">
      <div className="like-avatar-div">
        <NavLink to={"/" + liker.id} style={{ width: "100%", height: "100%" }} onClick={()=>typeof(setShowPost)==='function'&&setShowPost(false)}>
          <Avatar
            id="like-avatar-photo"
            src={
              liker.id === user._id
                ? profile
                : liker.image
                ? URL.createObjectURL(
                    new Blob([new Uint8Array(liker.image.data)])
                  )
                : ""
            }
          />
        </NavLink>
      </div>
      <div className="likers-name-div">
        <NavLink
          to={"/" + liker.id}
          style={{ textDecoration: "none", color: "black" }}
          onClick={()=>typeof(setShowPost)==='function'&&setShowPost(false)}
        >
          <p className="liker-name">
            {liker.id === user._id ? user.nickname : liker.nickname}
          </p>
        </NavLink>
      </div>
    </div>
  );
}
