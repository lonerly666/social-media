import axios from "axios";
import { useEffect, useState } from "react";
import "../css/userInfo.css";

export default function UserInfo(props) {
  const { userId, Avatar } = props;
  const [profile, setProfile] = useState();
  const [url, setUrl] = useState("");
  useEffect(() => {
    const ac = new AbortController();
    const formdata = new FormData();
    formdata.set("userId", userId);
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
          setProfile(res.message);
          setUrl(
            URL.createObjectURL(
              new Blob([new Uint8Array(res.message.profileImage.data)])
            )
          );
        } else {
          alert(res.message);
        }
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  const monthMap = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    10: "October",
    11: "November",
    12: "December",
  };

  function formatDate(date) {
    const today = new Date(parseInt(Date.parse(date), 10));
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    // return mm + '/' + dd + '/' + yyyy;
    return dd + " " + monthMap[mm] + " " + yyyy;
  }
  return (
    <div className="user-info-div">
      <div className="user-info-box" >
        <div className="user-info-avatar-holder">
          <Avatar src={url} style={{ width: "100%", height: "100%" }} />
        </div>
        <div className="user-info-details-div">
          <div className="user-details username">
            <h1>{profile && profile.nickname}</h1>
          </div>
          <div className="user-details dob">
            <p>{profile&&profile.nickname}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
