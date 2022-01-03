import "../css/home.css";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  IconButton,
  Avatar,
  NativeSelect,
  CircularProgress
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import { NavLink } from "react-router-dom";
import CreatePost from "./CreatePost";

export default function Home() {
  const [user, setUser] = useState("");
  const [posts, setPosts] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [postData, setPostData] = useState({

  });
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    axios
      .get("/auth/isLoggedIn")
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          if (res.message === "/login") window.open("/login", "_self");
          else {
            if (res.message.nickname === undefined)
              window.open("/form", "_self");
            let temp = res.message;
            console.log(temp);
            setUser(res.message);
            if (temp.profileImage) {
              const imgUrl = URL.createObjectURL(
                new Blob([new Uint8Array(temp.profileImage.data)])
              );
              setImageUrl(imgUrl);
            }
            axios
              .post("/post/all")
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                console.log(res);
              });
          }
        } else if (res.statusCode === 400) alert(res.message);
      })
      .catch((err) => console.log(err))
      .then(() => {
        setIsLoading(false);
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  return isLoading ? (
    <div></div>
  ) : (
    <div className="feed-div">
      <NavLink to="/login" hidden id="navi-login" />
      <NavLink to="/profile" hidden id="navi-profile" />
      <NavLink to="/form" draggable={false} style={{ textDecoration: "none" }}>
        <Button>FORM</Button>
      </NavLink>
      <Button onClick={() => setIsOpen(true)}>Create Post</Button>
      <Dialog
        open={isOpen}
        keepMounted
        onClose={() => setIsOpen(false)}
        maxWidth="100vw"
        PaperProps={{ style: { borderRadius: "20px",width:"40vw",height:"auto" } }}
      >
        <CreatePost
          user={user}
          IconButton={IconButton}
          CloseIcon={CloseIcon}
          Avatar={Avatar}
          url={imageUrl}
          Select={NativeSelect}
          isEdit={isEdit}
          postData={postData}
          newFiles = {newFiles}
          setNewFiles={setNewFiles}
          setPostData={setPostData}
          LoadingButton = {LoadingButton}
          CircularProgress = {CircularProgress}
          setIsOpen = {setIsOpen}
        />
      </Dialog>
    </div>
  );
}
