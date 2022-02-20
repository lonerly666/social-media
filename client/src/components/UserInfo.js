import axios from "axios";
import { useLayoutEffect, useState } from "react";
import "../css/userInfo.css";
import Typical from "react-typical";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BlockIcon from "@mui/icons-material/Block";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton, ClickAwayListener } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { NavLink } from "react-router-dom";

export default function UserInfo(props) {
  const {
    userId,
    Avatar,
    user,
    userUrl,
    friendReqList,
    setFriendReqList,
    pending,
    setPending,
    pendingAccept,
    setPendingAccept,
    choose,
    setChoose,
    isFriend,
    setIsFriend,
    handleAccept,
    handleDecline,
  } = props;
  const [profile, setProfile] = useState();
  const [url, setUrl] = useState("");
  const [bio, setBio] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [setting, setSetting] = useState(false);

  useLayoutEffect(() => {
    reset();
    const ac = new AbortController();
    if (userId !== user._id) {
      if (user.friendList.includes(userId)) setIsFriend(true);
      else if (
        friendReqList.filter((data) => data.senderId === userId).length > 0
      )
        setPendingAccept(true);
      else
        axios({
          method: "GET",
          url: "/user/requestStatus/" + userId,
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
        method: "GET",
        url: "/user/" + userId,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            setProfile(res.message);
            setUrl(
              res.message.profileImage
                ? URL.createObjectURL(
                    new Blob([new Uint8Array(res.message.profileImage.data)])
                  )
                : ""
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
  }, [userId]);
  function reset() {
    setIsFriend(false);
    setPending(false);
    setPendingAccept(false);
  }
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
  return isLoading ? (
    <div></div>
  ) : (
    <div className="user-info-div">
      <div className="user-info-box">
        {userId === user._id && (
          <ClickAwayListener onClickAway={() => setSetting(false)}>
            <div
              style={{
                position: "absolute",
                top: "3%",
                right: "2%",
                zIndex: 1000,
              }}
            >
              <IconButton onClick={() => setSetting(!setting)}>
                <SettingsIcon />
              </IconButton>
              {setting ? <div className="profile-setting-div">
                <NavLink className="profile-setting-option" to="/form">
                    <AccountCircleIcon fontSize="large"/>&nbsp;Profile Setting
                </NavLink>
              </div> : null}
            </div>
          </ClickAwayListener>
        )}
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
