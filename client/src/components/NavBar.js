import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { IconButton } from "@mui/material";
import { useState } from "react";
import "../css/navBar.css";
import FriendRequest from "./FriendRequest";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Notifications from "./Notifications";
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
  } = props;
  const [openList, setOpenList] = useState(false);
  const [fr, setFr] = useState(false);
  const [noti, setNoti] = useState(false);
  return (
    <div className="nav-bar">
      <div style={{ position: "relative" }}>
        <NavLink to="/login" hidden id="navi-login" />
        {/* <NavLink to="/profile" hidden id="navi-profile" /> */}
        <NavLink to="/" hidden id="navi-profile" />
        <NavLink
          to="/form"
          draggable={false}
          style={{ textDecoration: "none" }}
        >
          <Button>FORM</Button>
        </NavLink>
        <Button
          onClick={() => {
            document.getElementById("navi-profile").click();
            setRerun(!rerun);
            setIsLoading(true);
          }}
        >
          GO
        </Button>
        <div className="list-btn-div">
          <ClickAwayListener onClickAway={() => setOpenList(false)}>
            <div style={{ display: "flex", gap: "10px" }}>
              <IconButton
                id="fr-list-btn"
                onClick={() => {
                  if (fr && !noti) setOpenList(!openList);
                  else if (!fr && !noti) setOpenList(true);
                  else if (!fr && noti) setOpenList(true);
                  setFr(true);
                  setNoti(false);
                  console.log(friendReqList);
                }}
              >
                <PeopleAltIcon />
              </IconButton>
              <IconButton
                id="fr-list-btn"
                onClick={() => {
                  if (fr && !noti) setOpenList(true);
                  else if (!fr && !noti) setOpenList(true);
                  else if (!fr && noti) setOpenList(!openList);
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
        </div>
      </div>
    </div>
  );
}
