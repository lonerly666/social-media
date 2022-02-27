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
  const [searching, setSearching] = useState(false);
  const count = useRef(0);
  useLayoutEffect(() => {
    const ac = new AbortController();
    if (isEdit) {
      if (tag[0].nickname === undefined) {
        const formdata = new FormData();
        formdata.append("userList", JSON.stringify(postTag));
        axios
          .post("/user/multiple", formdata)
          .then((res) => res.data)
          .catch((err) => console.log(err))
          .then((res) => {
            if (res.statusCode === 200) {
              setTag([...res.message]);
              setCloneTag([...res.message]);
            } else {
              alert(res.message);
            }
          });
      }
    }
    return () => {
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const ac = new AbortController();
    if (search === "") {
      setShow(false);
    } else {
      setShow(true);
      setSearching(true);
      setNoRes(false);
      const formdata = new FormData();
      formdata.set("char", search);
      axios({
        method: "POST",
        url: "/user/tag",
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
  }, [search]);
  return (
    <div className="tag-div">
      <div className="tag-search-div">
        <InputBase
          className="tag-bar"
          value={search}
          onInput={(e) => setSearch(e.target.value)}
          style={{ textAlign: "center", color: "whitesmoke", gap: "10px" }}
          placeholder="Search.."
          startAdornment={<PersonSearchIcon />}
        />
        {show && (
          <div className="tag-autocomplete">
            {searching ? (
              <div className="autocomplete">
                <CircularProgress />
              </div>
            ) : noRes ? (
              <div>
                <p>There is no result</p>
              </div>
            ) : (
              usersList.map((data, index) => {
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
                    cloneTag={cloneTag}
                    setCloneTag={setCloneTag}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
      <div className="tag-box-chip">
        {tag.map((data) => {
          return (
            <ChipUsers
              key={data._id}
              user={data}
              setTag={setTag}
              setPostTag={setPostTag}
              tag={tag}
              cloneTag={cloneTag}
              setCloneTag={setCloneTag}
              setRemovedTag={setRemovedTag}
              removedTag={removedTag}
              postData={postData}
              isEdit={isEdit}
            />
          );
        })}
      </div>
    </div>
  );
}
