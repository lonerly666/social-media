import { Avatar } from "@mui/material";
import { NavLink } from "react-router-dom";

export default function OnlineUser(props) {
  const { user } = props;
  return (
    <div
      className="online-user-div"
      onClick={() => document.getElementById(user._id).click()}
    >
      <NavLink to={`/${user._id}`} hidden id={user._id} />
      <div>
        <Avatar
          src={URL.createObjectURL(
            new Blob([new Uint8Array(user.profileImage.data)])
          )}
          className="online-user-avatar"
        />
      </div>
      <div className="online-user-name">
        <b>{user.nickname}</b>
      </div>
    </div>
  );
}
