import axios from "axios";
import { useEffect, useState } from "react";
import "../css/post.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ClickAwayListener from "@mui/material/ClickAwayListener";

export default function Post(props) {
  const { post, Avatar, Carousel, user } = props;
  const [profile, setProfile] = useState("");
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  useEffect(() => {
    const ac = new AbortController();
    if (post.likeList.includes(user._id)) setLiked(true);
    const formdata = new FormData();
    formdata.set("userId", post.userId);
    axios({
      method: "POST",
      data: formdata,
      url: "/user/profileImage",
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        setProfile(
          URL.createObjectURL(new Blob([new Uint8Array(res.message.data)]))
        );
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  return (
    <div className="post-div">
      <div className="post-header">
        <div className="post-avatar-holder-div">
          <Avatar style={{ width: "70%", height: "70%" }} src={profile} />
        </div>
        <div className="post-details-div">
          <div className="post-details-name">{post.nickname}</div>
          <div className="post-details-date"></div>
        </div>
        <ClickAwayListener onClickAway={()=>setOpen(false)}>
            <div>
          <button
            id="post-more-btn"
            onClick={(e) => {
              setOpen(!open);
            }}
          >
            <MoreHorizIcon />
          </button>
          {open?(<div className="more-option-div">
                <h1>Hello World</h1>
          </div>):null}
          </div>
        </ClickAwayListener>
      </div>
      <div className="post-desc-div">
        <p>{post.desc}</p>
      </div>
      <div className="post-files-holder-div">
        <Carousel
          showArrows={true}
          swipeable={true}
          showStatus={false}
          infiniteLoop={true}
          autoPlay={false}
          showThumbs={false}
          emulateTouch={true}
        >
          {post.files.map((file) => {
            return (
              <div key={post._id} style={{ height: "40vh" }}>
                <img
                  src={URL.createObjectURL(
                    new Blob([new Uint8Array(file.data)])
                  )}
                />
              </div>
            );
          })}
        </Carousel>
      </div>
      <div className="post-padding-div">
        <div></div>
        <div className="post-option-div">
          <div className="like-div">
            <button className="post-option-btn" id="like-btn">
              <ThumbUpOffAltIcon />
              &nbsp;&nbsp;Like
            </button>
          </div>
          <div className="comment-div">
            <button className="post-option-btn" id="comment-btn">
              <ChatBubbleOutlineIcon />
              &nbsp;&nbsp;Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
