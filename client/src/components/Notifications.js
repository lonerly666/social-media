import { useEffect, useState } from "react";
import { Avatar } from "@mui/material";

export default function Notifications(props) {
  const { notification, setShowPost, setPostId, setOpenList, formatDate } =
    props;
  const [desc, setDesc] = useState("");
  useEffect(() => {
    const ac = new AbortController();
    if (notification.type === "LIKE_POST") setDesc(" liked your post");
    else if (notification.type === "LIKE_COMMENT")
      setDesc(" liked your comment");
    else if (notification.type === "COMMENT") setDesc(" commented your post");
    else if (notification.type === "BIRTHDAY") setDesc(" 's birthday today!");
    return function cancel() {
      ac.abort();
    };
  }, []);

  return (
    <div
      className="fr-div"
      onClick={() => {
        setShowPost(true);
        setPostId(notification.postId);
        setOpenList(false);
      }}
    >
      <div className="req-avatar-div">
        <Avatar
          src={
            notification.image
              ? URL.createObjectURL(
                  new Blob([new Uint8Array(notification.image.data)])
                )
              : ""
          }
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="req-info-div">
        <div className="req-info-name-div noti">
          <p style={{ margin: 0 }}>
            <strong>{notification.nickname}</strong>
            {desc}
          </p>
        </div>
        <span style={{fontSize:"12px",color:"gray",padding:"5px"}}>{formatDate(notification.dateOfCreation)}{formatDate(notification.dateOfCreation!=='today')&&" ago"}</span>
      </div>
    </div>
  );
}
