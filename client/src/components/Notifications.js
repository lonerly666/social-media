import axios from "axios";
import { useEffect, useState } from "react";
import { Avatar } from "@mui/material";

export default function Notifications(props) {
  const { notification, user } = props;
  const [info, setInfo] = useState(null);
  const [desc, setDesc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const ac = new AbortController();
    const formdata = new FormData();
    if(notification.type==="LIKE_POST")setDesc(" liked your post");
    else if(notification.type==="LIKE_COMMENT")setDesc(" liked your comment");
    else if(notification.type==="COMMENT")setDesc(" commented your post");
    else if(notification.type==="BIRTHDAY")setDesc(" 's birthday today!");
    formdata.append("userId", notification.senderId);
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
          setInfo(res.message);
          setIsLoading(false);
        } else alert(res.message);
      });
    return function cancel() {
      ac.abort();
    };
  }, []);

  return isLoading ? (
    <div></div>
  ) : (
    <div>
      <div className="fr-div">
        <div className="req-avatar-div">
          <Avatar
            src={URL.createObjectURL(
              new Blob([new Uint8Array(info.profileImage.data)])
            )}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="req-info-div">
          <div className="req-info-name-div">
            <p style={{ margin: 0 }}>
              <strong>{info.nickname}</strong>{desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
