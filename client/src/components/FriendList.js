import { TextField, InputAdornment, IconButton, Avatar } from "@mui/material";
import { AccountCircle, ClearTwoTone } from "@mui/icons-material";
import "../css/friendList.css";
import { useLayoutEffect, useState } from "react";
import Liker from "./Liker";
import axios from "axios";
export default function FriendList(props) {
  const { user, setUser, profile, userId, setOpenFriend } = props;
  const [originalList, setOriginalList] = useState([]);
  const [noRes, setNoRes] = useState(false);
  useLayoutEffect(() => {
    const ac = new AbortController();
    if (user.updatedFriendList === undefined) {
      const formdata = new FormData();
      formdata.append("userList", JSON.stringify(user.friendList));
      axios
        .post("/user/multiple", formdata)
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            if (res.message.length === 0) {
              setNoRes(true);
              return;
            }
            const temp = [...res.message];
            temp.sort(function (a, b) {
              if (a.nickname < b.nickname) {
                return -1;
              }
              if (a.nickname > b.nickname) {
                return 1;
              }
              return 0;
            });
            setUser((prevData) => {
              return { ...prevData, updatedFriendList: [...temp] };
            });
            setOriginalList([...temp]);
          } else {
            alert(res.message);
          }
        });
    } else {
      setOriginalList([...user.updatedFriendList]);
    }
    return () => {
      ac.abort();
    };
  }, []);
  async function filterFriendList(e) {
    const char = e.target.value;
    const formdata = new FormData();
    formdata.set("char", char);
    axios
      .post("/user/tag", formdata)
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          if (res.message.length === 0) {
            setNoRes(true);
            return;
          } else if (res.message === false) {
            setNoRes(false);
            setOriginalList([...user.updatedFriendList]);
          } else {
            setNoRes(false);
            const temp = [...res.message];
            temp.sort(function (a, b) {
              if (a.nickname < b.nickname) {
                return -1;
              }
              if (a.nickname > b.nickname) {
                return 1;
              }
              return 0;
            });
            setOriginalList([...temp]);
          }
        } else {
          alert(res.message);
        }
      });
  }
  return (
    <div className="friend-list-search-div">
      <IconButton
        onClick={() => setOpenFriend(false)}
        style={{ position: "absolute", top: "3%", left: "3%" }}
      >
        <ClearTwoTone style={{color:"black"}}/>
      </IconButton>
      <div className="friend-list-search-bar">
        <TextField
          id="input-with-icon-textfield"
          style={{ width: "100%" }}
          onInput={filterFriendList}
          label="Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          variant="standard"
        />
      </div>
      <div className="friend-list-scrollable">
        {noRes ? (
          <div className="friend-list-no-res">
            <p>There is no result</p>
          </div>
        ) : (
          originalList.map((data) => {
            return (
              <Liker
                key={data._id}
                liker={data}
                user={user}
                profile={profile}
                Avatar={Avatar}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
