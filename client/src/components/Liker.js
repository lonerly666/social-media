import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function Liker(props) {
  const { Avatar, liker, profile, user } = props;
  const [likerUrl, setLikerUrl] = useState("");
  useEffect(() => {
    const ac = new AbortController();
    if (liker.id !== user._id)
      axios
        .post("/user/profileImage/" + liker.id)
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            setLikerUrl(
              URL.createObjectURL(new Blob([new Uint8Array(res.message.data)]))
            );
          } else {
            alert(res.message);
          }
        });
        return function cancel() {
          ac.abort();
        };
  }, []);
  return (
    <div className="liker-details-div">
      <div className="like-avatar-div">
        <NavLink to={"/"+liker.id} style={{width:"100%",height:"100%"}}><Avatar id="like-avatar-photo" src={liker.id===user._id?profile:likerUrl} /></NavLink>
      </div>
      <div className="likers-name-div">
        <NavLink to={"/"+liker.id} style={{textDecoration:"none",color:"black"}}><p className="liker-name">{liker.name}</p></NavLink>
      </div>
    </div>
  );
}
