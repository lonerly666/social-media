import "../css/home.css";
import { useLayoutEffect, useEffect, useState, useRef } from "react";
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
import NavBar from "./NavBar";
import socket from "./Socket";
import PostInfo from "./PostInfo";
import CreateIcon from "@mui/icons-material/Create";
import Skeleton from "@mui/material/Skeleton";
import About from "./About";
import OnlineList from "./OnlineList";

export default function Home(props) {
  const { userId } = props;
  const [user, setUser] = useState("");
  const [other, setOther] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postData, setPostData] = useState();
  const [imageUrl, setImageUrl] = useState("");
  const [friendReqList, setFriendReqList] = useState([]);
  const [notificationList, setNotificationList] = useState([]);
  const [pending, setPending] = useState(false);
  const [pendingAccept, setPendingAccept] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [choose, setChoose] = useState(false);
  const [rerun, setRerun] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [postId, setPostId] = useState("");
  const [postElement, setPostElement] = useState(null);
  const [about, setAbout] = useState(false);
  const [onlineUser, setOnlineUser] = useState([]);
  const [received, setReceived] = useState(false);
  const [ready, setReady] = useState(false);
  const numOfSkip = useRef(0);

  //Intersection Observer
  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const lastElement = entries[0];
        if (!lastElement.isIntersecting) return;
        fetchMorePost();
        observer.current.unobserve(lastElement.target);
      },
      {
        threshold: 0.5,
      }
    )
  );

  useLayoutEffect(() => {
    reset();
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
            setReady(true);
            setPostElement(null);
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
              .get("/user/friendRequests")
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                if (res.statusCode === 200) {
                  setFriendReqList([...res.message]);
                } else {
                  alert(res.message);
                }
              });
            const formdata = new FormData();
            if (userId) {
              formdata.set("userId", userId);
            }
            formdata.set("numOfSkip", 0);
            await axios
              .get("/notification/all")
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                if (res.statusCode === 200) {
                  setNotificationList([...res.message]);
                } else {
                  alert(res.message);
                }
              });
            await axios({
              method: "POST",
              url: userId ? "/post/" + userId : "/post/all",
              data: formdata,
              headers: { "Content-Type": "multipart/form-data" },
            })
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                if (res.statusCode === 200) {
                  setPosts(res.message);
                  numOfSkip.current += res.numOfSkip;
                  setIsLoading(false);
                } else {
                  alert(res.message);
                }
              });
          }
        } else if (res.statusCode === 400) alert(res.message);
      })
      .catch((err) => console.log(err));
    return function cancel() {
      ac.abort();
    };
  }, [userId, rerun]);

  //Intersection Obeserver
  useEffect(() => {
    if (postElement) observer.current.observe(postElement);
  }, [postElement, rerun]);

  useEffect(() => {
    if (!isOpen) {
      setIsEdit(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const ac = new AbortController();
    if (user) {
      if (!received) {
        console.log("");
        socket.emit("ONLINED");
        socket.on("ONLINE_LIST", async (list) => {
          const formdata = new FormData();
          const filterArray = (arr1, arr2) => {
            const filtered = arr1.filter((el) => {
              return arr2.indexOf(el) !== -1;
            });
            return filtered;
          };
          formdata.append(
            "userList",
            JSON.stringify(filterArray(list, user.friendList))
          );
          await axios
            .post("/user/multiple", formdata)
            .then((res) => res.data)
            .catch((err) => console.log(err))
            .then((res) => {
              if (res.statusCode === 200) {
                setOnlineUser([...res.message]);
                setReceived(true);
              } else {
                alert(res.message);
              }
            });
        });
      }
      socket.on("ONLINE", async (id) => {
        if (user.friendList.includes(id)) {
          await axios
            .get(`/user/${id}`)
            .then((res) => res.data)
            .catch((err) => console.log(err))
            .then((res) => {
              if (res.statusCode === 200) {
                setOnlineUser((prevData) => {
                  return [...prevData, { ...res.message }];
                });
              } else {
                alert(res.message);
              }
            });
        }
      });
      socket.on("OFFLINE", (id) => {
        if (user.friendList.includes(id)) {
          setOnlineUser((prevData) => {
            return prevData.filter((data) => {
              return data._id !== id;
            });
          });
        }
      });
    }

    return () => {
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function reset() {
    setAbout(false);
    setIsLoading(true);
    setPosts([]);
    setFriendReqList([]);
    setNotificationList([]);
    setPostElement(null);
    numOfSkip.current = 0;
  }

  async function handleAccept(reqId, senderId) {
    const formdata = new FormData();
    const targetId = reqId.target
      ? friendReqList.filter((req) => req.senderId === userId)[0]._id
      : reqId;
    formdata.set("friendId", senderId ? senderId : userId);
    formdata.set("reqId", targetId);
    await axios({
      method: "POST",
      url: "/user/accept",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          if (res.message === "unsent") {
            alert("Other party has unsent the request");
            setPendingAccept(false);
            setFriendReqList((prevData) => {
              return [
                ...prevData.filter((data) => {
                  return data._id !== targetId;
                }),
              ];
            });
          } else {
            setIsFriend(true);
            setPendingAccept(false);
            setFriendReqList((prevData) => {
              return [
                ...prevData.filter((data) => {
                  return data._id !== targetId;
                }),
              ];
            });
          }
          setChoose(false);
        } else {
          alert(res.message);
        }
      });
  }
  async function handleDecline(reqId) {
    const formdata = new FormData();
    const targetId = reqId.target
      ? friendReqList.filter((req) => req.senderId === userId)[0]._id
      : reqId;
    formdata.set("reqId", targetId);
    await axios({
      method: "POST",
      url: "/user/decline",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setPendingAccept(false);
          setChoose(false);
          setFriendReqList((prevData) => {
            return [
              ...prevData.filter((data) => {
                return data._id !== targetId;
              }),
            ];
          });
        } else {
          alert(res.message);
        }
      });
  }
  async function fetchMorePost() {
    const formdata = new FormData();
    formdata.append("numOfSkip", numOfSkip.current);
    setIsLoading(true);
    await axios({
      method: "POST",
      url: userId ? "/post/" + userId : "/post/all",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          setPosts((prevData) => {
            return [...prevData, ...res.message];
          });
          numOfSkip.current += res.numOfSkip;
        } else {
          alert(res.message);
        }
      })
      .then(() => {
        setIsLoading(false);
      });
  }
  return ready ? (
    <div className="feed-div">
      <NavBar
        NavLink={NavLink}
        Button={Button}
        setRerun={setRerun}
        rerun={rerun}
        setIsLoading={setIsLoading}
        friendReqList={friendReqList}
        handleDecline={handleDecline}
        handleAccept={handleAccept}
        notificationList={notificationList}
        setNotificationList={setNotificationList}
        setFriendReqList={setFriendReqList}
        user={user}
        socket={socket}
        setPostId={setPostId}
        setShowPost={setShowPost}
      />
      {showPost ? (
        <PostInfo
          postId={postId}
          user={user}
          profile={imageUrl}
          setShowPost={setShowPost}
        />
      ) : (
        <div className="post-feed-div">
          {userId && (
            <UserInfo
              userId={userId}
              Avatar={Avatar}
              user={user}
              userUrl={imageUrl}
              friendReqList={friendReqList}
              setFriendReqList={setFriendReqList}
              handleAccept={handleAccept}
              handleDecline={handleDecline}
              pending={pending}
              setPending={setPending}
              pendingAccept={pendingAccept}
              setPendingAccept={setPendingAccept}
              isFriend={isFriend}
              setIsFriend={setIsFriend}
              choose={choose}
              setChoose={setChoose}
              about={about}
              setAbout={setAbout}
            />
          )}
          {about && (
            <About
              user={user._id === userId ? user : other}
              setUser={user._id === userId ? setUser : setOther}
              userId={userId}
            />
          )}
          <div style={{ padding: " 2% 0 5% 0" }}>
            {posts.map((post) => {
              return (
                <Post
                  key={post._id}
                  setPostElement={setPostElement}
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
                  setRerun={setRerun}
                  rerun={rerun}
                />
              );
            })}
            {isLoading && (
              <div>
                <div className="post-skeleton">
                  <div className="post-skeleton-header">
                    <Skeleton
                      variant="circular"
                      width={60}
                      height={60}
                      animation="wave"
                    />
                    <Skeleton variant="text" animation="wave" width={300} />
                  </div>
                  <Skeleton variant="text" animation="wave" height={50} />
                  <Skeleton variant="rectangle" animation="wave" height={300} />
                </div>
                <div className="post-skeleton">
                  <div className="post-skeleton-header">
                    <Skeleton
                      variant="circular"
                      width={60}
                      height={60}
                      animation="wave"
                    />
                    <Skeleton variant="text" animation="wave" width={300} />
                  </div>
                  <Skeleton variant="text" animation="wave" height={50} />
                  <Skeleton variant="rectangle" animation="wave" height={300} />
                </div>
              </div>
            )}
          </div>
          <Dialog
            open={isOpen}
            onClose={() => {
              setIsOpen(false);
            }}
            transitionDuration={0}
            maxWidth="100vw"
            PaperProps={{
              style: {
                borderRadius: "20px",
                width: "40vw",
                height: "auto",
                marginTop: "6%",
              },
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
      )}
      {!showPost && (
        <button
          className="create-post-btn-div"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          {/* <div className="create-post-btn-avatar">
                  <Avatar src={imageUrl} style={{width:"50px",height:"50px"}}/>
                </div> */}
          <CreateIcon id="create-post-btn-icon" />
          <span className="create-post-btn-title">Create Post</span>
        </button>
      )}
      {!showPost && <OnlineList user={onlineUser} />}
    </div>
  ) : (
    <div>

    </div>
  );
}
