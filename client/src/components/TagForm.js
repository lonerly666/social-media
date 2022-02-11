import axios from "axios";
import { useState } from "react";
import AutoComplete from "./AutoComplete";
import AutocompleteDiv from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Avatar } from "@mui/material";

export default function TagForm(props) {
  const { user, friend, setFriend, tag, setTag } = props;
  const [loading, setLoading] = useState(false);
  async function handleSearchFriends(e) {
    setLoading(true);
    const formdata = new FormData();
    formdata.set("char", e.target.value);
    await axios({
      method: "POST",
      url: "/user/getFriendByChar",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setFriend([...res.message]);
          setLoading(false);
        } else {
          alert(res.message);
        }
      });
  }
  return (
    <div className="tag-div">
      <div className="tag-search-div">
        <AutocompleteDiv
          multiple
          value={[...tag]}
          onChange={(e, val) =>
            setTag(
              val.map((data) => {
                return { _id: data._id, nickname: data.nickname };
              })
            )
          }
          limitTags={3}
          id="multiple-limit-tags"
          options={friend}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="tag a friend"
              placeholder="Search..."
              onInput={handleSearchFriends}
            />
          )}
          getOptionLabel={(options) => options.nickname || ""}
          renderOption={(props, option) => {
            return (
              <h4 {...props} key={option._id}>
                {option.nickname}
              </h4>
            );
          }}
          isOptionEqualToValue={(option, value) => option._id === value._id}
        />
      </div>
    </div>
  );
}
