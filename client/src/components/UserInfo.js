import axios from "axios";
import { useEffect, useState } from "react";
import "../css/userInfo.css";
import Typical from "react-typical";
import { Button } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BlockIcon from "@mui/icons-material/Block";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

export default function UserInfo(props) {
  const { userId, Avatar, user, userUrl, friendReqList, setFriendReqList } =
    props;
  const [profile, setProfile] = useState();
  const [url, setUrl] = useState("");
  const [bio, setBio] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [pendingAccept, setPendingAccept] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [choose, setChoose] = useState(false);
  useEffect(() => {
    const ac = new AbortController();
    console.log(friendReqList);
    if (userId !== user._id) {
      const formdata = new FormData();
      formdata.set("userId", userId);
      if (user.friendList.includes(userId)) setIsFriend(true);
      else if (
        friendReqList.filter((data) => data.senderId === userId).length > 0
      )
        setPendingAccept(true);
      else
        axios({
          method: "POST",
          url: "/user/getRequestStatus",
          data: formdata,
          headers: { "Content-Type": "multipart/form-data" },
        })
          .then((res) => res.data)
          .catch((err) => console.log(err))
          .then((res) => {
            if (res.statusCode === 200) {
              if (res.message.length > 0) {
                setPending(true);
              }
            } else {
              alert(res.message);
            }
          });
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
            setBio(res.message.bio);
          } else {
            alert(res.message);
          }
        })
        .then(() => setIsLoading(false));
    } else setIsLoading(false);
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
  async function handleFriendAction() {
    const formdata = new FormData();
    formdata.set("receiverId", userId);
    if (!isFriend && !pending) {
      await axios({
        method: "POST",
        url: "/user/send",
        data: formdata,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 201) {
            setPending(true);
          } else if (res.statusCode === 200) {
            alert("other party has already sent a request");
            setPendingAccept(true);
            setFriendReqList((prevData) => {
              return [...prevData, res.message];
            });
            console.log(res);
          } else {
            alert(res.message);
          }
        });
    } else if (isFriend) {
      await axios({
        method: "POST",
        url: "/user/remove",
        data: formdata,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            setIsFriend(false);
          } else {
            alert(res.message);
          }
        });
    } else if (pending) {
      await axios({
        method: "POST",
        url: "/user/unsend",
        data: formdata,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            if (res.message === "friend") {
              alert("You are already friends with him");
              setIsFriend(true);
              setPending(false);
            } else setPending(false);
          } else {
            alert(res.message);
          }
        });
    }
  }
  async function handleAccept() {
    const formdata = new FormData();
    const targetId = friendReqList.filter((req) => req.senderId === userId)[0]
      ._id;
    formdata.set("friendId", userId);
    formdata.set("reqId", targetId);
    await axios({
      method: "POST",
      url: "/user/accept",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          if (res.message === "unsent") {
            alert("Other party has unsent the request");
            setPendingAccept(false);
            setFriendReqList((prevData) => {
              return [
                ...prevData.filter((data) => {
                  return data._id !== targetId;
                }),
              ];
            });
          } else {
            setIsFriend(true);
            setPendingAccept(false);
          }
          setChoose(false);
        } else {
          alert(res.message);
        }
      });
  }
  async function handleDecline() {
    const formdata = new FormData();
    formdata.set(
      "reqId",
      friendReqList.filter((req) => req.senderId === userId)[0]._id
    );
    await axios({
      method: "POST",
      url: "/user/decline",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setPendingAccept(false);
          setChoose(false);
        } else {
          alert(res.message);
        }
      });
  }
  return isLoading ? (
    <div></div>
  ) : (
    <div className="user-info-div">
      <div className="user-info-box">
        <div className="user-add-icon-div">
          {userId !== user._id && (
            <button
              id="user-add-icon"
              onClick={
                pendingAccept
                  ? () => {
                      setChoose(true);
                    }
                  : handleFriendAction
              }
            >
              {!isFriend && !pending && !pendingAccept && <PersonAddIcon />}
              {pending && "Pending"}
              {pendingAccept && "Accept?"}
              {isFriend && <BlockIcon />}
            </button>
          )}
          {choose && (
            <div className="user-add-icon-div choose">
              <button
                id="user-add-icon"
                onClick={handleAccept}
                style={{ borderRadius: "none" }}
              >
                <CheckIcon />
              </button>
              <button
                id="user-add-icon"
                onClick={handleDecline}
                style={{ borderRadius: "none" }}
              >
                <ClearIcon />
              </button>
            </div>
          )}
        </div>

        <div className="user-info-avatar-holder">
          <Avatar
            src={userId === user._id ? userUrl : url}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="user-info-details-div">
          <div className="user-details username">
            <h1>
              {userId === user._id
                ? user.nickname
                : profile && profile.nickname}
            </h1>
          </div>
          <div className="user-details dob">
            <p>
              {userId === user._id
                ? user.nickname
                : profile && profile.nickname}
            </p>
          </div>
        </div>
      </div>
      <div className="user-info-bio">
        <h2>BIO</h2>
        <p style={{ fontSize: "20px" }}>
          <Typical
            steps={[userId === user._id ? user.bio : bio, 5]}
            wrapper="b"
            loop={1}
          />
        </p>
      </div>
    </div>
  );
}
