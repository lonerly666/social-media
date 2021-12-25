import { useEffect, useState } from "react";
import axios from "axios";
import { set } from "mongoose";

export default function UserForm() {
  const [nickname, setNickName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  useEffect(() => {
    const ac = new AbortController();
    axios
      .get("/auth/isLoggedIn")
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200)
          if (res.message === "/login") window.open(res.message, "_self");
          else if (res.message.nickname) {
            setIsEdit(true);
            const temp = res.message;
            setNickName(temp.nickname);
            setBio(temp.bio);
            setGender(temp.gender);
          } else if (res.statusCode === 400) alert(res.message);
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  async function saveUserInfo() {
    const formdata = new FormData();
    formdata.append("nickname",nickname);
    formdata.append("gender",gender);
    formdata.append("bio",bio);
    formdata.append("dateOfBirth",new Date())
    await axios({
      method: "post",
      url: "/user/saveInfo",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(res=>res.data)
    .catch(err=>console.log(err))
    .then(res=>{
        console.log(res);
    })
  }

  return (
    <div>
      <form action="/user/saveInfo" method="POST">
        <input
          type="text"
          name="nickname"
          value={nickname}
          onChange={(e) => setNickName(e.target.value)}
        />
        <input
          type="text"
          name="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        />
        <input
          type="text"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <input type="submit" />
      </form>
    </div>
  );
}
