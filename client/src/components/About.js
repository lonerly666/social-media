import "../css/about.css";
import FriendList from "./FriendList";
import CakeIcon from "@mui/icons-material/Cake";
import WcTwoToneIcon from "@mui/icons-material/WcTwoTone";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { Dialog } from "@mui/material";
import { useLayoutEffect, useState } from "react";
import axios from "axios";

export default function About(props) {
  const { user, setUser, userId } = props;
  const [openFriend, setOpenFriend] = useState(false);
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
  useLayoutEffect(() => {
    const ac = new AbortController();
    if (user === null)
      axios
        .get(`/user/${userId}`)
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            setUser({ ...res.message });
          } else {
            alert(res.message);
          }
        });
    return () => {
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function formatDate(date) {
    const today = new Date(parseInt(Date.parse(date), 10));
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    // return mm + '/' + dd + '/' + yyyy;
    return dd + " " + monthMap[mm] + " " + yyyy;
  }
  return (
    <div className="user-about-div">
      <div className="user-about-title">
        <h1>ABOUT</h1>&nbsp;
        <InfoTwoToneIcon style={{ fontSize: "30px" }} />
      </div>
      <div className="user-about-details">
        <div className="user-about-details-desc">
          <span>
            <CakeIcon style={{ color: "whitesmoke" }} />
          </span>
          &nbsp;
          <h4>Birthday:</h4>&nbsp;
          <b>{formatDate(user && user.dateOfBirth)}</b>
        </div>
        <div className="user-about-details-desc">
          <span>
            <WcTwoToneIcon />
          </span>{" "}
          <h4>Gender: {user && user.gender}</h4>
        </div>
        <div className="user-about-details-desc">
          <h4>Number of Post: {user && user.numOfPosts}</h4>
        </div>
        <div
          className="user-about-details-desc friend-list"
          onClick={() => setOpenFriend(true)}
        >
          <h3>Friends: {user && user.friendList.length}</h3>
        </div>
      </div>
      <Dialog
        open={openFriend}
        onClose={() => {
          setOpenFriend(false);
        }}
        transitionDuration={0}
        maxWidth="100vw"
        PaperProps={{
          style: {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            borderRadius: "20px",
            width: "30vw",
            height: "70vh",
          },
        }}
      >
        <FriendList
          user={user}
          setUser={setUser}
          userId={userId}
          setOpenFriend={setOpenFriend}
        />
      </Dialog>
    </div>
  );
}
