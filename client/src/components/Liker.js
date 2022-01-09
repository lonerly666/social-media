import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function Liker(props) {
  const { Avatar, liker, profile, user } = props;
  const [likerUrl, setLikerUrl] = useState("");
  const [likerName, setLikerName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const ac = new AbortController();
    if (liker !== user._id) {
      const formdata = new FormData();
      formdata.append("userId", liker);
      axios({
        method: "POST",
        data: formdata,
        url: "/user/username",
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then(async (res) => {
          if (res.statusCode === 200) {
            setLikerName(res.message.nickname);
            setIsLoading(false);
            await axios
              .post("/user/profileImage/" + liker)
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                if (res.statusCode === 200) {
                  setLikerUrl(
                    URL.createObjectURL(
                      new Blob([new Uint8Array(res.message.data)])
                    )
                  );
                } else {
                  alert(res.message);
                }
              });
          } else alert(res.message);
        });
    } else setIsLoading(false);
    return function cancel() {
      ac.abort();
    };
  }, []);
  return isLoading ? (
    <div></div>
  ) : (
    <div className="liker-details-div">
      <div className="like-avatar-div">
        <NavLink to={"/" + liker} style={{ width: "100%", height: "100%" }}>
          <Avatar
            id="like-avatar-photo"
            src={liker === user._id ? profile : likerUrl}
          />
        </NavLink>
      </div>
      <div className="likers-name-div">
        <NavLink
          to={"/" + liker}
          style={{ textDecoration: "none", color: "black" }}
        >
          <p className="liker-name">
            {liker === user._id ? user.nickname : likerName}
          </p>
        </NavLink>
      </div>
    </div>
  );
}
