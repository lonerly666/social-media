import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { IconButton } from "@mui/material";
import { useState } from "react";
import "../css/navBar.css";
import FriendRequest from "./FriendRequest";
import ClickAwayListener from "@mui/material/ClickAwayListener";
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
  } = props;
  const [openFR, setOpenFR] = useState(false);
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
        <div className="fr-btn-div">
          <ClickAwayListener onClickAway={() => setOpenFR(false)}>
            <div>
              <IconButton id="fr-list-btn" onClick={() => setOpenFR(!openFR)}>
                <PeopleAltIcon />
              </IconButton>
              {openFR ? (
                <div className="fr-list-div">
                    <div className="fr-title-div"><h2>Friend Requests</h2></div>
                  {friendReqList.map((req) => {
                    return (
                      <FriendRequest
                        fr={req}
                        key={req._id}
                        handleDecline={handleDecline}
                        handleAccept={handleAccept}
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
