import "../css/friendRequest.css";
import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FriendRequest(props) {
  const { fr,handleDecline,handleAccept } = props;
  const [request, setRequest] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const ac = new AbortController();
    const formdata = new FormData();
    formdata.append("userId", fr.senderId);
    axios({
      method: "POST",
      url: "/user/info",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setRequest(res.message);
          setIsLoaded(true);
        } else {
          alert(res.message);
        }
      });
    return function cancel() {
      ac.abort();
    };
  }, []);

  return isLoaded ? (
    <div className="fr-div">
      <div className="req-avatar-div">
        <Avatar
          src={URL.createObjectURL(
            new Blob([new Uint8Array(request.profileImage.data)])
          )}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="req-info-div">
        <div className="req-info-name-div">
         <p style={{margin:0}}><strong>{request.nickname}</strong> wants to add you as friend</p>
        </div>
        <div className="req-info-option-div">
          <button className="req-option-btn accept" onClick={()=>handleAccept(fr._id,fr.senderId)}>Accept</button>
          <button className="req-option-btn decline" onClick={()=>handleDecline(fr._id)}>Decline</button>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
