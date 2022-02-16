import axios from "axios";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import "../css/tagForm.css";
import AutoComplete from "./AutoComplete";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { InputBase, CircularProgress } from "@mui/material";
import ChipUsers from "./ChipUsers";

export default function TagForm(props) {
  const {
    user,
    tag,
    setTag,
    postTag,
    cloneTag,
    setCloneTag,
    setPostTag,
    setRemovedTag,
    removedTag,
    postData,
    isEdit,
  } = props;
  const [search, setSearch] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [show, setShow] = useState(false);
  const [noRes, setNoRes] = useState(false);
  const count = useRef(0);
  useLayoutEffect(() => {
    const ac = new AbortController();
    const temp = [];
    let update = false;
    async function updateComponent() {
      await Promise.all(
        tag.map(async (data) => {
          if (!data.nickname) {
            update = true;
            const formdata = new FormData();
            formdata.append("userId", data.id);
            await axios
              .post("/user/nameAndImage", formdata)
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                if (res.statusCode === 200) {
                  temp.push({
                    id: data.id,
                    nickname: res.message.nickname,
                    profile: res.message.profileImage,
                  });
                } else {
                  alert(res.message);
                }
              });
          }
        })
      );
      if (update) {
        setCloneTag([...temp]);
        setTag([...temp]);
      }
    }
    updateComponent();
    return () => {
      ac.abort();
    };
  }, []);
  useEffect(() => {
    const ac = new AbortController();
    if (search.trim().length > 0) {
      setShow(true);
      setNoRes(false);

      const formdata = new FormData();
      formdata.set("char", search);
      axios({
        method: "POST",
        url: "/user/getFriendByChar",
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
          } else {
            alert(res.message);
          }
        });
    } else {
      setShow(false);
    }
    return function cancel() {
      ac.abort();
    };
  }, [search]);
  return (
    <div className="tag-div">
      <div className="tag-search-div">
        <InputBase
          className="tag-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ textAlign: "center", color: "whitesmoke", gap: "10px" }}
          placeholder="Search.."
          startAdornment={<PersonSearchIcon />}
        />
        {show && (
          <div className="tag-autocomplete">
            {usersList.map((data, index) => {
              count.current = index;
              return (
                <AutoComplete
                  users={data}
                  setSearch={setSearch}
                  key={data._id}
                  setShow={setShow}
                  count={count}
                  setTag={setTag}
                  listLength={usersList.length}
                  user={user}
                  isTag={true}
                  postTag={postTag}
                  setPostTag={setPostTag}
                  setRemovedTag={setRemovedTag}
                  removedTag={removedTag}
                  postData={postData}
                  isEdit={isEdit}
                  cloneTag ={cloneTag}
                  setCloneTag={setCloneTag}
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
      <div className="tag-box-chip">
        {tag.map((data) => {
          return (
            <ChipUsers
              key={data.id}
              user={data}
              setTag={setTag}
              setPostTag={setPostTag}
              tag={tag}
              cloneTag = {cloneTag}
              setCloneTag = {setCloneTag}
              setRemovedTag={setRemovedTag}
              removedTag={removedTag}
              postData={postData}
            />
          );
        })}
      </div>
    </div>
  );
}
