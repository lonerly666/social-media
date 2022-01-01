import { useEffect, useState, useRef } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import Avatar from "@mui/material/Avatar";
import Cropper from "react-avatar-editor";
const pica = require("pica/dist/pica.min")();

export default function UserForm() {
  const [nickname, setNickName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [image, setImage] = useState({
    original: null,
    originalBuffer: null,
    cropped: null,
    croppedBuffer: null,
    coord: {
      x:null,
      y:null
    },
  });
  const [isEdit, setIsEdit] = useState(false);
  const editor = useRef();
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
            console.log(res.message);
            setIsEdit(true);
            const temp = res.message;
            setNickName(temp.nickname);
            setBio(temp.bio);
            setGender(temp.gender);
            setDob(temp.dateOfBirth);
            if (temp.imagePosition) {
              setImage((prevData) => {
                return { ...prevData, coord: temp.imagePosition };
              });
            }
            if (temp.profileImage) {
              const imgUrl = URL.createObjectURL(
                new Blob([new Uint8Array(temp.profileImage.data)])
              );
              setImage((prevData) => {
                return { ...prevData, cropped: imgUrl };
              });
            }
            if (temp.originalImage) {
              const imgUrl = URL.createObjectURL(
                new Blob([new Uint8Array(temp.originalImage.data)])
              );
              setImage((prevData) => {
                return { ...prevData, original: imgUrl };
              });
            }
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
      if (file.size > 200000) {
        alert("File too big to handle! Please select a smaller file size!");
        return;
      }
    }
    addInfo(formdata);
  }
  async function addInfo(formdata) {
    formdata.append("nickname", nickname);
    formdata.append("gender", gender);
    formdata.append("dateOfBirth", dob);
    formdata.append("bio", bio);
    formdata.append("cropped", image.croppedBuffer);
    formdata.append("original", image.originalBuffer);
    formdata.append("coord", JSON.stringify(image.coord));
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
  async function cropImg() {
    const cropped = editor.current.getImage();
    var offScreenCanvas = document.createElement("canvas");
    offScreenCanvas.width = 250;
    offScreenCanvas.height = 250;
    const picaCanvas = await pica.resize(cropped, offScreenCanvas);
    picaCanvas.toBlob(async(blob) => {
      const fr = new FileReader();
      fr.readAsArrayBuffer(blob);
      fr.onload = async(event) => {
        const res = event.target.result;
        const url = URL.createObjectURL(new Blob([new Uint8Array(res)]));
        setImage((prevData) => {
          return {
            ...prevData,
            croppedBuffer: new File([res], "cropped"),
            cropped:url,
          };
        });
      };
    },'image/*',1);
  }
  return (
    <div>
      <form onSubmit={saveInfo}>
        <input
          type="file"
          name="fileId"
          accept="image/*"
          onChange={(e) => {
            const url = URL.createObjectURL(e.target.files[0]);
            setImage((prevData) => {
              return {
                ...prevData,
                original: url,
                cropped: url,
                originalBuffer: e.target.files[0],
              };
            });
          }}
        />
        <Avatar alt="Profile" id="test" src={image.cropped} style={{width:250,height:250}}/>
        <Cropper
          id="editor"
          ref={editor}
          height={250}
          width={250}
          image={image.original}
          borderRadius={250}
          scale={1.2}
          color={[255, 255, 255, 0.6]}
          position={image.coord}
          onMouseUp={cropImg}
          onPositionChange={(coord) => {
            setImage((prevData) => {
              return { ...prevData, coord:{
                x:coord.x,
                y:coord.y
              }};
            });
          }}
        />
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
