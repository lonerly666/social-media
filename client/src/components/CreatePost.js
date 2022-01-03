import { useEffect, useState, useCallback } from "react";
import "../css/createPost.css";
import SelectedImage from "./SelectedImage";
import Gallery from "react-photo-gallery";
import AddPhoto from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";

export default function CreatePost(props) {
  const [post, setPost] = useState({
    feeling: "",
    desc: "",
    tags: [],
  });
  const [file, setFile] = useState([]);
  const [selectedFile, setSelectedFile] = useState([]);
  const [hasImage, setHasImage] = useState(false);
  const {
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
  function auto_grow(event) {
    event.target.style.height = "5px";
    event.target.style.height = (event.target.scrollHeight)+"px";
}
  return (
    <div className="create-div">
      <input
        hidden
        type="file"
        id="upload-btn"
        onChange={handleUploadImage}
        multiple
      />
      <div className="title-div">
        <h1>{isEdit ? "Edit" : "Create"} Post</h1>
        <IconButton id="close-btn">
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
            onChange={(e) =>
              setPostData((prevData) => {
                return { ...prevData, isPublic: e.target.value };
              })
            }
            id="select-public"
          >
            <option value={0}>Private</option>
            <option value={1}>Public</option>
            <option value={2}>Friends Only</option>
          </select>
        </div>
      </div>
      <div className="scrollable-div">
        <div className="desc-div">
          <textarea
            className="desc-text"
            value={post.desc}
            placeholder={"What's on your mind? " + user.nickname}
            onChange={(e) =>
              setPost((prevData) => {
                return { ...prevData, desc: e.target.value };
              })
            }
            onInput={auto_grow}
          ></textarea>
        </div>
        {hasImage && (
          <div className="upload-file-div">
            <Gallery photos={file} renderImage={imageRenderer} />
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
    </div>
  );
}
