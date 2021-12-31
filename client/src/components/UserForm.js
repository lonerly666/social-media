import { useEffect, useState } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import Avatar from "@mui/material/Avatar";

export default function UserForm() {
  const [nickname, setNickName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [url, setUrl] = useState("");
  const [binary,setBinary] = useState(null);
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
            setDob(temp.dateOfBirth);
            setBinary(temp.profileImage);
            setUrl(
              URL.createObjectURL(
                new Blob([new Uint8Array(temp.profileImage.data)])
              )
            );
          } else if (res.statusCode === 400) alert(res.message);
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  async function saveInfo(event) {
    event.preventDefault();
    const formdata = new FormData();
    const file = event.target.fileId.files[0];
    if (file) {
      if (file.size <= 200000) {
        const fr = new FileReader();
        fr.readAsArrayBuffer(file);
        fr.onload = (event) => {
          const res = event.target.result;
          formdata.append("img", file);
          addInfo(formdata);
        };
      } else {
        alert("File size too big! Please choose smaller size file");
      }
    }
    else{
      formdata.append('buffer',binary);
      addInfo(formdata)
    }
  }
  async function addInfo(formdata) {
    formdata.append("nickname", nickname);
    formdata.append("gender", gender);
    formdata.append("dateOfBirth", dob);
    formdata.append("bio", bio);
    await axios({
      method: "POST",
      url: "/user/saveInfo",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          window.open(res.message, "_self");
        }
      });
  }
  return (
    <div>
      <form onSubmit={saveInfo}>
        <input type="file" name="fileId" accept="image/*" onChange={(e)=>{
           setUrl(URL.createObjectURL(e.target.files[0]))
        }}/>
        <Avatar alt="Profile" id="test" src={url}/>
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
        <LocalizationProvider dateAdapter={AdapterDateFns} name="dateOfBirth">
          <DatePicker
            label="Date Of Birth"
            views={["year", "month", "day"]}
            value={dob}
            onChange={(e) => {
              setDob(e);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <input type="submit" />
      </form>
    </div>
  );
}
