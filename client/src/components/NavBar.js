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
import InputBase from "@mui/material/InputBase";
import axios from "axios";
import AutoComplete from "./AutoComplete";
export default function NavBar(props) {
  const {
    NavLink,
    Button,
    setRerun,
    rerun,
    setIsLoading,
    friendReqList,
    handleDecline,
    handleAccept,
    notificationList,
    setNotificationList,
    user,
    socket,
  } = props;
  const [openList, setOpenList] = useState(false);
  const [fr, setFr] = useState(false);
  const [noti, setNoti] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const count = useRef(0);
  const tempList = useRef([...notificationList]);
  useEffect(() => {
    socket.on("sendNoti", (doc) => {
      const result = JSON.parse(doc);
      if (tempList.current.length > 0) {
        if (
          tempList.current.filter((data) => {
            return (
              data.postId === result.postId && data.senderId === result.senderId
            );
          }).length === 0
        ) {
          tempList.current.push(result);
          setNotificationList((prevData) => {
            return [result, ...prevData];
          });
        }
      } else {
        setNotificationList([result]);
        tempList.current.push(result);
      }
    });
  }, []);
  useEffect(() => {
    const ac = new AbortController();
    if (search.trim().length > 0) setShow(true);
    else {
      setShow(false);
    }
    const formdata = new FormData();
    formdata.set("char", search);
    axios({
      method: "POST",
      url: "/user/getAllUser",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then(async (res) => {
        if (res.statusCode === 200) {
          setUsersList([...res.message]);
        } else {
          alert(res.message);
        }
      });

    return function cancel() {
      ac.abort();
    };
  }, [search]);
  return (
    <div className="nav-bar">
      <div
        className="nav-bar-title"
        onClick={() => {
          setRerun(!rerun);
          document.getElementById("navi-home").click();
        }}
      >
        <h3>Media Lounge</h3>
      </div>
      <div className="nav-search-div">
        <InputBase
          // sx={{ ml: 1, flex: 1 }}
          className="nav-searchbar"
          style={{ textAlign: "center", color: "whitesmoke", gap: "10px" }}
          placeholder="Search.."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={<PersonSearchIcon />}
        />
        {show && (
          <div className="autocomplete-div">
            {usersList.map((data, index) => {
              count.current = index;
              return (
                <AutoComplete
                  users={data}
                  key={data._id}
                  setShow={setShow}
                  count={count}
                  listLength={usersList.length}
                  user={user}
                />
              );
            })}
            {count.current !== usersList.length - 1 && (
              <div className="autocomplete">
                <CircularProgress />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="nav-bar-btn-div">
        <NavLink to="/login" hidden id="navi-login" />
        {/* <NavLink to="/profile" hidden id="navi-profile" /> */}
        <NavLink to="/" hidden id="navi-home" />
        <NavLink to="/form" hidden id="navi-profile" />
        <button
          className="nav-option-btn"
          onClick={() => {
            document.getElementById("navi-home").click();
            setRerun(!rerun);
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
                </div>
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
                      />
                    );
                  })}
              </div>
            ) : null}
          </div>
        </ClickAwayListener>
        <div className="nav-profile-div">
          <Avatar
            src={URL.createObjectURL(
              new Blob([new Uint8Array(user.profileImage.data)])
            )}
          />
          <div className="nav-profile-name">
            <h3>{user.nickname}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
