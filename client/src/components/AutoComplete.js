import { Avatar } from "@mui/material";
import { NavLink } from "react-router-dom";
import "../css/autoComplete.css";

export default function AutoComplete(props) {
  const {
    users,
    setSearched,
    setShowPost,
    isTag,
    setTag,
    postTag,
    setPostTag,
    setSearch,
    setRemovedTag,
    postData,
    isEdit,
  } = props;
  return (
    <div
      className="autocomplete"
      onClick={() => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        if (typeof setShowPost === "function") setShowPost(false);
        if (!isTag) setSearched(true);
        if (isTag === true) {
          setSearch("");
          if (postTag.includes(users._id)) {
            setPostTag((prevData) => {
              return prevData.filter((data) => {
                return data !== users._id;
              });
            });
            setTag((prevData) => {
              return prevData.filter((data) => {
                return data._id !== users._id;
              });
            });
            if (isEdit)
              if (postData.tags.includes(users._id)) {
                setRemovedTag((prevData) => {
                  return [...prevData, users._id];
                });
              }
          } else {
            setPostTag((prevData) => {
              return [...prevData, users._id];
            });
            setTag((prevData) => {
              return [...prevData, { ...users }];
            });
            if (isEdit === true) {
              if (postData.tags.includes(users._id)) {
                setRemovedTag((prevData) => {
                  return prevData.filter((data) => {
                    return data !== users._id;
                  });
                });
              }
            }
          }
        } else {
          setSearch(users.nickname);
          document.getElementById(users._id).click();
        }
      }}
    >
      {isTag === undefined && (
        <NavLink to={"/" + users._id} hidden id={users._id} />
      )}
      <div className="autocomplete-avatar">
        <Avatar
          src={
            users.profileImage
              ? URL.createObjectURL(
                  new Blob([new Uint8Array(users.profileImage.data)])
                )
              : ""
          }
          // style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="autocomplete-name">
        <h3>{users.nickname}</h3>
      </div>
    </div>
  );
}
