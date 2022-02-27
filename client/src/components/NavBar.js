import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Avatar, IconButton } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import "../css/navBar.css";
import FriendRequest from "./FriendRequest";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Notifications from "./Notifications";
import CircularProgress from "@mui/material/CircularProgress";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import MessageIcon from "@mui/icons-material/Message";
import HomeIcon from "@mui/icons-material/Home";
import { InputBase } from "@mui/material";
import axios from "axios";
import AutoComplete from "./AutoComplete";
export default function NavBar(props) {
  const {
    NavLink,
    setRerun,
    rerun,
    friendReqList,
    handleDecline,
    handleAccept,
    notificationList,
    setNotificationList,
    user,
    socket,
    setShowPost,
    setPostId,
    setFriendReqList,
  } = props;
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const [openList, setOpenList] = useState(false);
  const [fr, setFr] = useState(false);
  const [noti, setNoti] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [noRes, setNoRes] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const count = useRef(0);
  let tempList = useRef([...notificationList]);
  let tempList2 = useRef([...friendReqList]);
  useEffect(() => {
    const ac = new AbortController();
    socket.on("sendNoti", (doc) => {
      const result = JSON.parse(doc);
      if (
        tempList.current.filter((data) => {
          return (
            data.postId === result.postId &&
            data.senderId === result.senderId &&
            data.type === result.type
          );
        }).length !== 1
      ) {
        tempList.current.push(result);
        setNotificationList((prevData) => {
          return [result, ...prevData];
        });
      }
    });
    socket.on("newFR", (doc) => {
      const result = JSON.parse(doc);
      console.log(result);
      if (
        tempList2.current.filter((data) => {
          return data.senderId === result.senderId;
        }).length !== 1
      ) {
        tempList2.current.push(result);
        setFriendReqList((prevData) => {
          return [result, ...prevData];
        });
      }
    });
    return function cancel() {
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const ac = new AbortController();
    setSearched(false);
    if (search === "") {
      setShow(false);
    } else {
      setShow(searched ? false : true);
      setSearching(true);
      setNoRes(false);
      const formdata = new FormData();
      formdata.set("char", search);
      axios({
        method: "POST",
        url: "/user/search",
        data: formdata,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then(async (res) => {
          if (res.statusCode === 200) {
            if (res.message.length === 0) {
              setNoRes(true);
            }
            setUsersList([...res.message]);
            setSearching(false);
          } else {
            alert(res.message);
          }
        });
    }
    return () => {
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
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
  async function handleDeleteAllNotification() {
    await axios
      .delete("/notification/all")
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setNotificationList([]);
          tempList.current = [];
        } else {
          alert(res.message);
        }
      });
  }
  return (
    <div className="nav-bar">
      <div className="nav-bar-overlay">
        <div
          className="nav-bar-title"
          onClick={() => {
            if (typeof (setShowPost === "function")) setShowPost(false);
            setRerun(!rerun);
            setSearch("");
            tempList.current = [];
            tempList2.current = [];
            document.getElementById("navi-home").click();
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
          }}
        >
          <h3>Media Lounge</h3>
        </div>
        <div className="nav-search-div">
          <InputBase
            className="nav-searchbar"
            style={{ textAlign: "center", color: "whitesmoke", gap: "10px" }}
            placeholder="Search.."
            value={search}
            onInput={(e) => setSearch(e.target.value)}
            startAdornment={<PersonSearchIcon />}
            onFocus={(e) => console.log(e.target.focus())}
          />
          {show && (
            <div className="autocomplete-holder">
              <div className="autocomplete-div">
                {searching ? (
                  <div className="autocomplete">
                    <CircularProgress />
                  </div>
                ) : noRes ? (
                  <div>
                    <h4>There is no result</h4>
                  </div>
                ) : (
                  usersList.map((data, index) => {
                    count.current = index;
                    return (
                      <AutoComplete
                        users={data}
                        key={data._id}
                        setSearch={setSearch}
                        setSearched={setSearched}
                        count={count}
                        listLength={usersList.length}
                        user={user}
                        setShowPost={setShowPost}
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        <div className="nav-bar-btn-div">
          <NavLink to="/login" hidden id="navi-login" />
          {/* <NavLink to="/profile" hidden id="navi-profile" /> */}
          <NavLink to="/" hidden id="navi-home" />
          <NavLink to="/form" hidden id="navi-profile" />
          <NavLink to={"/" + user._id} hidden id="profile" />
          <button
            className="nav-option-btn"
            onClick={() => {
              if (typeof (setShowPost === "function")) setShowPost(false);
              tempList.current = [];
              tempList2.current = [];
              document.getElementById("navi-home").click();
              setRerun(!rerun);
              setSearch("");
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
            }}
          >
            <HomeIcon />
          </button>
          <button className="nav-option-btn">
            <MessageIcon />
          </button>
        </div>
        <div className="list-btn-div">
          <ClickAwayListener onClickAway={() => setOpenList(false)}>
            <div style={{ display: "flex", gap: "10px" }}>
              <IconButton
                id="fr-list-btn"
                onClick={() => {
                  if (fr && !noti) setOpenList(!openList);
                  else setOpenList(true);
                  setFr(true);
                  setNoti(false);
                }}
              >
                <PeopleAltIcon />
              </IconButton>
              <IconButton
                id="fr-list-btn"
                onClick={() => {
                  if (!fr && noti) setOpenList(!openList);
                  else setOpenList(true);
                  setNoti(true);
                  setFr(false);
                }}
              >
                <NotificationsIcon />
              </IconButton>
              {openList ? (
                <div className="fr-list-div">
                  <div className="fr-title-div">
                    {fr && <h2>Friend Requests</h2>}
                    {noti && <h2>Notifications</h2>}
                    {noti && notificationList.length > 0 && (
                      <button
                        className="noti-clear-btn"
                        onClick={handleDeleteAllNotification}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="fr-list">
                    {fr &&
                      friendReqList.map((req) => {
                        return (
                          <FriendRequest
                            fr={req}
                            key={req._id}
                            handleDecline={handleDecline}
                            handleAccept={handleAccept}
                            openList={openList}
                            setOpenList={setOpenList}
                          />
                        );
                      })}
                    {noti &&
                      notificationList.map((noti) => {
                        return (
                          <Notifications
                            key={noti._id}
                            notification={noti}
                            openList={openList}
                            setOpenList={setOpenList}
                            setShowPost={setShowPost}
                            setPostId={setPostId}
                            _MS_PER_DAY={_MS_PER_DAY}
                            formatDate={formatDate}
                          />
                        );
                      })}
                  </div>
                </div>
              ) : null}
            </div>
          </ClickAwayListener>
          <div
            className="nav-profile-div"
            onClick={() => {
              document.getElementById("profile").click();
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
            }}
          >
            <Avatar
              src={
                user.profileImage
                  ? URL.createObjectURL(
                      new Blob([new Uint8Array(user.profileImage.data)])
                    )
                  : ""
              }
            />
            <div className="nav-profile-name">
              <h3>{user.nickname}</h3>
            </div>
          </div>
          <div
            className="nav-logout"
            onClick={() => (window.location.href = "/auth/logout")}
          >
            <b>Logout</b>
          </div>
        </div>
      </div>
    </div>
  );
}
