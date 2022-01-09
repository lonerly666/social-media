import "../css/home.css";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  IconButton,
  Avatar,
  NativeSelect,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import { NavLink } from "react-router-dom";
import CreatePost from "./CreatePost";
import Post from "./Post";
import { Carousel } from "react-responsive-carousel";
import UserInfo from "./UserInfo";

export default function Home(props) {
  const { userId } = props;
  const [user, setUser] = useState("");
  const [posts, setPosts] = useState([]);
  const [postFiles, setPostFiles] = useState([]);
  const [postData, setPostData] = useState();
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [friendReqList, setFriendReqList] = useState([]);
  const [rerun, setRerun] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    axios
      .get("/auth/isLoggedIn")
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then(async (res) => {
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
            await axios
              .post("/user/getFriendRequests")
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                if (res.statusCode === 200) {
                  setFriendReqList(res.message);
                  console.log(res);
                } else {
                  alert(res.message);
                }
              });
            const formdata = new FormData();
            if (userId) {
              formdata.set("userId", userId);
            }
            await axios({
              method: "POST",
              url: userId ? "/post/getPostByUser" : "/post/all",
              data: formdata,
              headers: { "Content-Type": "multipart/form-data" },
            })
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                console.log(res);
                if (res.statusCode === 200) {
                  setPosts(res.message);
                }
              })
              .then(() => {
                setIsLoading(false);
              });
          }
        } else if (res.statusCode === 400) alert(res.message);
      })
      .catch((err) => console.log(err));
    return function cancel() {
      ac.abort();
    };
  }, [userId, rerun]);
  useEffect(() => {
    if (!isOpen) {
      setIsEdit(false);
    }
  }, [isOpen]);
  return isLoading ? (
    <div></div>
  ) : (
    <div className="feed-div">
      <div className="nav-bar">
        <NavLink to="/login" hidden id="navi-login" />
        {/* <NavLink to="/profile" hidden id="navi-profile" /> */}
        <NavLink to="/" hidden id="navi-profile" />
        <NavLink
          to="/form"
          draggable={false}
          style={{ textDecoration: "none" }}
        >
          <Button>FORM</Button>
        </NavLink>
        <Button
          onClick={() => {
            document.getElementById("navi-profile").click();
            setRerun(!rerun);
            setIsLoading(true);
          }}
        >
          GO
        </Button>
      </div>
      <div className="post-feed-div">
        {userId && (
          <UserInfo
            userId={userId}
            Avatar={Avatar}
            user={user}
            userUrl={imageUrl}
            friendReqList={friendReqList}
          />
        )}
        <div style={{ padding: " 2% 0 5% 0" }}>
          <div className="create-post-btn-div">
            <Button onClick={() => setIsOpen(true)}>Create Post</Button>
          </div>
          {posts.map((post) => {
            return (
              <Post
                key={post._id}
                post={post}
                user={user}
                Avatar={Avatar}
                Carousel={Carousel}
                setIsOpen={setIsOpen}
                setIsEdit={setIsEdit}
                setPostData={setPostData}
                setPosts={setPosts}
                Dialog={Dialog}
                imageUrl={imageUrl}
              />
            );
          })}
        </div>
        <Dialog
          open={isOpen}
          onClose={() => {
            setPostData({});
            setIsOpen(false);
          }}
          transitionDuration={0}
          maxWidth="100vw"
          PaperProps={{
            style: { borderRadius: "20px", width: "40vw", height: "auto" },
          }}
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
            setPostData={setPostData}
            LoadingButton={LoadingButton}
            CircularProgress={CircularProgress}
            setIsOpen={setIsOpen}
            setPosts={setPosts}
            isOpen={isOpen}
          />
        </Dialog>
      </div>
    </div>
  );
}
