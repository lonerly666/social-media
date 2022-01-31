import { Avatar } from "@mui/material";
import { NavLink } from "react-router-dom";
import "../css/autoComplete.css";

export default function AutoComplete(props) {
  const { users,setShow,count,listLength,user} = props;
  return (
    <div className="autocomplete" onClick={()=>{setShow(false); document.getElementById(users._id).click()}} style={{display:count.current===listLength-1?"flex":"none"}}>
        <div className="autocomplete-holder">
        <NavLink to={"/"+users._id} hidden id={users._id}/>
      <div className="autocomplete-avatar">
        <div className="autocomplete-avatar-holder">
          <Avatar
            src={users.profileImage?URL.createObjectURL(
              new Blob([new Uint8Array(users.profileImage.data)])
            ):""}
            style={{width:"100%",height:"100%"}}
          />
        </div>
      </div>
      <div className="autocomplete-name">
        <div className="">
          <h3>{users.nickname}</h3>
        </div>
      </div>
      </div>
    </div>
  );
}
