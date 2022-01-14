import "../css/friendRequest.css";
import { Avatar } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

export default function FriendRequest(props) {
  const { fr, handleDecline, handleAccept, openList, setOpenList } = props;
  const [request, setRequest] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
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

  function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }
  function formatDate(date) {
    const today = new Date();
    const commentDate = new Date(parseInt(Date.parse(date), 10));
    let diffInDay = dateDiffInDays(commentDate, today);
    if (diffInDay === 0) {
      return "today";
    } else {
      if (diffInDay >= 7) {
        return `${Math.floor(diffInDay / 7)} w`;
      } else {
        return `${diffInDay} d`;
      }
    }
  }
  return isLoaded ? (
    <div className="fr-div" onClick={() => {document.getElementById(request._id).click(); setOpenList(!openList)}}>
      <NavLink to={"/" + request._id} hidden id={request._id} />
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
          <p style={{ margin: 0 }}>
            <strong>{request.nickname}</strong> wants to add you as friend
          </p>
        </div>
        <div className="req-info-option-div">
          <button
            className="req-option-btn accept"
            onClick={() => handleAccept(fr._id, fr.senderId)}
          >
            Accept
          </button>
          <button
            className="req-option-btn decline"
            onClick={() => handleDecline(fr._id)}
          >
            Decline
          </button>
        </div>
      </div>
      <p className="list-date">{formatDate(fr.dateOfCreation)}</p>
    </div>
  ) : (
    <div></div>
  );
}
