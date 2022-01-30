import axios from "axios";
import { useEffect, useRef, useState } from "react";
import "../css/postInfo.css";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Avatar } from "@mui/material";
export default function PostInfo(props) {
  const { user,profile,postId } = props;

  const [filePage, setFilePage] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [postInfo, setPostInfo] = useState({});
  const [currFile, setCurrFile] = useState("");
  const [postFiles, setPostFiles] = useState([]);
  let fileIndex = useRef(0);
  useEffect(async () => {
    const ac = new AbortController();
    if (postId) {
      axios
        .get("/post/" + postId)
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            setPostInfo(res.message);
            setCurrFile(
              URL.createObjectURL(
                new Blob([new Uint8Array(res.message.files[0].data)])
              )
            );
            res.message.files.map((file) => {
              setPostFiles((prevData) => {
                return [
                  ...prevData,
                  URL.createObjectURL(new Blob([new Uint8Array(file.data)])),
                ];
              });
            });
          } else {
            alert(res.message);
          }
        })
        .then(() => {
          setLoaded(true);
        });
    }

    return function cancel() {
      ac.abort();
    };
  }, [postId]);
  function rotateImage(arrow) {
    if (arrow === "left") {
      fileIndex.current--;
      if (fileIndex.current < 0) {
        fileIndex.current = postFiles.length - 1;
      }
    } else {
      fileIndex.current++;
      if (fileIndex.current > postFiles.length - 1) {
        fileIndex.current = 0;
      }
    }
    setFilePage(fileIndex.current);
    setCurrFile(postFiles[fileIndex.current]);
  }
  return loaded ? (
    <div className="post-info-div">
      <div
        className="post-info-images-div"
        onMouseOver={() => {
          if (postFiles.length > 1) {
            document.getElementById("right").style.display = "block";
            document.getElementById("left").style.display = "block";
          }
        }}
        onMouseLeave={() => {
          document.getElementById("right").style.display = "none";
          document.getElementById("left").style.display = "none";
        }}
      >
        <button
          onClick={() => rotateImage("right")}
          className="img-rotate-btn right"
          id="right"
        >
          <ArrowForwardIosIcon />
        </button>
        <button
          onClick={() => rotateImage("left")}
          className="img-rotate-btn left"
          id="left"
        >
          <ArrowBackIosNewIcon />
        </button>
        <img
          src={currFile}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
      <div className="post-info-details-div">
        <div className="post-info-details-head">
          <div className="post-info-profile-img">
            <Avatar
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              src={
                postInfo.userId === user._id
                  ? profile
                  : URL.createObjectURL(
                      new Blob([new Uint8Array(postInfo.image.data)])
                    )
              }
            />
          </div>
          <div className="post-info-title">
            <h3>{postInfo.nickname}</h3>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
