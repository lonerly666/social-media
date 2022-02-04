import axios from "axios";
import { useState } from "react";

export default function TagForm(props) {
  const { user } = props;
  const [char, setChar] = useState("");
  async function handleSearchFriends(e) {
    setChar(e.target.value);
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
          console.log(res.message);
        } else {
          alert(res.message);
        }
      });
  }
  return (
    <div className="tag-div">
      <div className="tag-search-div">
        <input type="search" onChange={handleSearchFriends} value={char} />
      </div>
    </div>
  );
}
