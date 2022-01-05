import { useEffect, useState, useCallback } from "react";
import "../css/createPost.css";
import SelectedImage from "./SelectedImage";
import Gallery from "react-photo-gallery";
import AddPhoto from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import axios from "axios";

export default function CreatePost(props) {
  const [post, setPost] = useState({
    feeling: "",
    desc: "",
    tags: [""],
    isPublic: 1,
  });
  const [file, setFile] = useState([]);
  const [selectedFile, setSelectedFile] = useState([]);
  const [hasImage, setHasImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const {
    LoadingButton,
    IconButton,
    user,
    CloseIcon,
    Avatar,
    url,
    Select,
    isEdit,
    postData,
    setNewFiles,
    newFiles,
    setPostData,
    CircularProgress,
    setIsOpen,
  } = props;
  const imageRenderer = useCallback(
    ({ index, left, top, key, photo }) => (
      <SelectedImage
        key={key}
        margin={"2px"}
        index={index}
        photo={photo}
        left={left}
        top={top}
        handleSelectedImage={handleSelectedImage}
        handleUnselectImage={handleUnselectImage}
      />
    ),
    [handleSelectedImage]
  );
  useEffect(() => {
    const ac = new AbortController();
    if (isEdit) {
      setPost({
        feeling: postData.feeling,
        desc: postData.desc,
        tags: postData.tags,
      });
      if (postData.files) {
        setHasImage(true);
        postData.files.map((files) => {
          return setPost((prevData) => {
            return {
              ...prevData,
              files: files.push({
                src: files,
                width: 1,
                height: 1,
                id: files._id,
              }),
            };
          });
        });
      }
    }
    return function cancel() {
      ac.abort();
    };
  }, [isEdit, postData]);
  function handleUnselectImage(index) {
    setSelectedFile((prevData) => {
      return prevData.filter((data) => {
        return data !== index;
      });
    });
  }
  function handleSelectedImage(index) {
    setSelectedFile((prevData) => {
      return [...prevData, index];
    });
  }
  function handleUploadImage(event) {
    setHasImage(true);
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      setNewFiles((prevData) => {
        return [...prevData, file];
      });
      setFile((prevData) => {
        return [
          ...prevData,
          { src: URL.createObjectURL(file), width: 1, height: 1 },
        ];
      });
    }
  }
  function handleDeleteSelected() {
    const temp = [...selectedFile].sort();
    const tempFile = [...file];
    for (let i = temp.length - 1; i >= 0; i--) {
      tempFile.splice(temp[i], 1);
    }
    setFile(tempFile);
    setSelectedFile([]);
    if (tempFile.length === 0) setHasImage(false);
  }
  async function uploadPost(e) {
    e.preventDefault();
    setIsUploading(true);
    document.getElementById("post-btn").style.color= "transparent";
    if (isEdit)
      setPostData((prevData) => {
        return {
          ...prevData,
          feeling: post.feeling,
          desc: post.desc,
          tags: post.tags,
          isPublic: post.isPublic,
        };
      });
    const formdata = new FormData();
    formdata.append("feeling", isEdit ? postData.feeling : post.feeling);
    formdata.append("desc", isEdit ? postData.desc : post.desc);
    formdata.append("tags", isEdit ? postData.tags : post.tags);
    formdata.append("public", isEdit ? postData.isPublic : post.isPublic);
    newFiles.map(files=>{
      formdata.append("newUploades",files);
    })
    if (!isEdit) formdata.set("dateOfCreation", new Date());
    await axios({
      method: "POST",
      data: formdata,
      url: isEdit ? "/post/edit" : "/post/create",
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if(res.statusCode===201||res.statusCode===200)
          setIsOpen(false);
      });
  }
  return (
    <div className="create-div">
      <form onSubmit={uploadPost}>
        <input type="submit" hidden id="upload-input"/>
        <input
          hidden
          type="file"
          id="upload-btn"
          onChange={handleUploadImage}
          multiple
        />
        <div className="title-div">
          <h1>{isEdit ? "Edit" : "Create"} Post</h1>
          <IconButton id="close-btn" onClick={()=>setIsOpen(false)}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="greet-div">
          <div className="small-avatar-div">
            <Avatar src={url} style={{ height: "50px", width: "50px" }} />
          </div>
          <div className="greet-text">
            Hi, {user.nickname} how are you feeling today?
          </div>
          <div className="select-div">
            <Select
              value={post.feeling}
              onChange={(event) =>
                setPost((prevData) => {
                  return { ...prevData, feeling: event.target.value };
                })
              }
              id="create-feeling"
              name="feeling"
            >
              <option aria-label="None" value="" />
              <option value="happy">Happy 😀</option>
              <option value="sad">Sad ☹️</option>
              <option value="surprised">Surprised 😮</option>
              <option value="meh">Meh 😕</option>
              <option value="annoyed">Annoyed 🙄</option>
              <option value="sleepy">Sleepy 😴</option>
              <option value="loved">Loved 🥰</option>
              <option value="touched">Touched 😭</option>
              <option value="shy">Shy 😌</option>
              <option value="amazed">Amazed 🤩</option>
            </Select>
            <select
              value={post.isPublic}
              onChange={(e) =>
                setPost((prevData) => {
                  return { ...prevData, isPublic: e.target.value };
                })
              }
              id="select-public"
            >
              <option value={0}>Private</option>
              <option value={1}>Public</option>
              <option value={2}>Friends</option>
            </select>
          </div>
        </div>
        <div className="scrollable-div">
          <div className="desc-div">
            <TextareaAutosize
              className="desc-text"
              value={post.desc}
              placeholder={"What's on your mind? " + user.nickname}
              onChange={(e) =>
                setPost((prevData) => {
                  return { ...prevData, desc: e.target.value };
                })
              }
            ></TextareaAutosize>
          </div>
          {hasImage && (
            <div className="upload-file-div">
              <Gallery photos={file} renderImage={imageRenderer} id="gallery" />
            </div>
          )}
        </div>
        <div className="upload-btn-div">
          <IconButton
            onClick={() => document.getElementById("upload-btn").click()}
          >
            <AddPhoto />
          </IconButton>
          {hasImage && (
            <IconButton onClick={handleDeleteSelected}>
              <DeleteIcon />
            </IconButton>
          )}
        </div>
        <div className="post-btn-div">
          <LoadingButton
            id="post-btn"
            loading={isUploading}
            loadingIndicator={
              <CircularProgress
                style={{ width: "3vh", height: "3vh", color: "whitesmoke" }}
              />
            }
            onClick={()=>document.getElementById('upload-input').click()}
            variant="contained"
          >
            POST
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
