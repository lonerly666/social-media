import { Avatar } from "@mui/material";
import { NavLink } from "react-router-dom";
import "../css/autoComplete.css";

export default function AutoComplete(props) {
  const {
    users,
    setShow,
    count,
    listLength,
    user,
    setShowPost,
    isTag,
    setTag,
    postTag,
    setPostTag,
    setSearch,
    setRemovedTag,
    postData,
    isEdit,
    cloneTag,
    setCloneTag,
  } = props;
  return (
    <div
      className="autocomplete"
      onClick={() => {
        if (typeof setShowPost === "function") setShowPost(false);
        setShow(false);
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
                return data.id !== users._id;
              });
            });
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
              return [
                ...prevData,
                {
                  id: users._id,
                  nickname: users.nickname,
                  profile: users.profileImage,
                },
              ];
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
      style={{ display: count.current === listLength - 1 ? "flex" : "none" }}
    >
      <div className="autocomplete-holder">
        {isTag === undefined && (
          <NavLink to={"/" + users._id} hidden id={users._id} />
        )}
        <div className="autocomplete-avatar">
          <div className="autocomplete-avatar-holder">
            <Avatar
              src={
                users.profileImage
                  ? URL.createObjectURL(
                      new Blob([new Uint8Array(users.profileImage.data)])
                    )
                  : ""
              }
              style={{ width: "100%", height: "100%" }}
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
