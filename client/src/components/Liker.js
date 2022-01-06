import axios from "axios";
import { useEffect, useState } from "react";

export default function Liker(props) {
  const { Avatar, liker } = props;
  const [likerUrl, setLikerUrl] = useState("");
  useEffect(() => {
    axios
      .post("/user/profileImage/" + liker.id)
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setLikerUrl(
            URL.createObjectURL(new Blob([new Uint8Array(res.message.data)]))
          );
        }
        else{
            alert(res.message);
        }
      });
  }, []);
  return (
    <div className="liker-details-div">
      <div className="like-avatar-div">
        <Avatar id="like-avatar-photo" src={likerUrl}/>
      </div>
      <div className="likers-name-div">
        <p>{liker.name}</p>
      </div>
    </div>
  );
}
