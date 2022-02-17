import { useEffect, useState, useCallback } from "react";
import "../css/createPost.css";
import SelectedImage from "./SelectedImage";
import Gallery from "react-photo-gallery";
import AddPhoto from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import TagForm from "./TagForm";

export default function CreatePost(props) {
  const [post, setPost] = useState({
    feeling: "",
    desc: "",
    isPublic: 1,
  });
  const [file, setFile] = useState([]);
  const [toDelete, setToDelete] = useState([]);
  const [selectedFile, setSelectedFile] = useState([]);
  const [hasImage, setHasImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openTag, setOpenTag] = useState(false);
  const [tag, setTag] = useState([]);
  const [cloneTag, setCloneTag] = useState([]);
  const [postTag, setPostTag] = useState([]);
  const [removedTag, setRemovedTag] = useState([]);

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
    setPostData,
    CircularProgress,
    setIsOpen,
    setPosts,
    isOpen,
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
        file={file}
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
        isPublic: postData.isPublic,
        tags: [...postData.tags],
      });
      setPostTag([...postData.tags]);
      if (postData.tagDetails !== undefined) {
        setTag([...postData.tagDetails]);
        setCloneTag([...postData.tagDetails]);
      } else {
        postData.tags.map((id) => {
          setTag((prevData) => {
            return [...prevData, { id: id }];
          });
          setCloneTag((prevData) => {
            return [...prevData, { id: id }];
          });
        });
      }
      if (postData.files) {
        setHasImage(true);
        setFile(
          postData.files.map((file) => {
            return {
              src: URL.createObjectURL(new Blob([new Uint8Array(file.data)])),
              width: 1,
              height: 1,
              file: "yes",
            };
          })
        );
      }
      return function cancel() {
        ac.abort();
      };
    }
  }, [isOpen]);
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
  async function handleUploadImage(event) {
    setHasImage(true);
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      setFile((prevData) => {
        return [
          ...prevData,
          { src: URL.createObjectURL(file), width: 1, height: 1, file: file },
        ];
      });
    }
  }
  function handleDeleteSelected() {
    const temp = [...selectedFile].sort();
    setToDelete((prevData) => {
      return [
        ...prevData,
        ...temp.filter((data) => {
          return file[data].file === "yes";
        }),
      ];
    });
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
    document.getElementById("post-btn").style.color = "transparent";
    const formdata = new FormData();
    if (isEdit) {
      setPostData((prevData) => {
        return {
          ...prevData,
          feeling: post.feeling,
          desc: post.desc,
          isPublic: post.isPublic,
        };
      });
      const newTags = [];
      for (let i = 0; i < postTag.length; i++) {
        if (!postData.tags.includes(postTag[i])) {
          newTags.push(postTag[i]);
        }
      }
      formdata.append("newTags", JSON.stringify(newTags));
      formdata.append("removedTags", JSON.stringify(removedTag));
    }
    formdata.append("feeling", isEdit ? postData.feeling : post.feeling);
    formdata.append("desc", isEdit ? postData.desc : post.desc);
    formdata.append("tags", JSON.stringify(postTag));
    formdata.append("public", isEdit ? postData.isPublic : post.isPublic);
    if (isEdit) formdata.append("postId", postData._id);
    if (isEdit) formdata.append("toDelete", JSON.stringify(toDelete));
    file.map((files) => {
      formdata.append("newUploades", files.file);
    });
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
        if (res.statusCode === 201 || res.statusCode === 200) {
          setIsOpen(false);
          setPosts((prevData) => {
            if (isEdit) {
              let temp = [];
              for (let i = 0; i < prevData.length; i++) {
                if (prevData[i]._id === res.message._id)
                  temp.push({ ...res.message, tagDetails: [...tag] });
                else temp.push(prevData[i]);
              }
              return temp;
            }
            return [{ ...res.message, tagDetails: [...tag] }, ...prevData];
          });
        }
      });
  }
  return (
    <div className="create-div">
      <form onSubmit={uploadPost}>
        <input type="submit" hidden id="upload-input" />
        <input
          hidden
          type="file"
          id="upload-btn"
          onChange={handleUploadImage}
          multiple
        />
        <div className="title-div">
          <h1>{isEdit ? "Edit" : "Create"} Post</h1>
          <IconButton id="close-btn" onClick={() => setIsOpen(false)}>
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
              onChange={(event) => {
                setPost((prevData) => {
                  return { ...prevData, feeling: event.target.value };
                });
                if (isEdit)
                  setPostData((prevData) => {
                    return { ...prevData, feeling: event.target.value };
                  });
              }}
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
              onChange={(e) => {
                setPost((prevData) => {
                  return { ...prevData, isPublic: e.target.value };
                });
                if (isEdit)
                  setPostData((prevData) => {
                    return { ...prevData, isPublic: e.target.value };
                  });
              }}
              id="select-public"
            >
              <option value={0}>Private</option>
              <option value={1}>Public</option>
              <option value={2}>Friends</option>
            </select>
            <button
              className="post-tag-btn"
              onClick={(e) => {
                e.preventDefault();
                setOpenTag(!openTag);
              }}
            >
              <b>Tags {tag.length > 0 && tag.length}</b>
            </button>
          </div>
        </div>
        <div className="scrollable-div">
          <div className="desc-div">
            <TextareaAutosize
              className="desc-text"
              value={post.desc}
              placeholder={"What's on your mind? " + user.nickname}
              onChange={(e) => {
                setPost((prevData) => {
                  return { ...prevData, desc: e.target.value };
                });
                if (isEdit)
                  setPostData((prevData) => {
                    return { ...prevData, desc: e.target.value };
                  });
              }}
            />
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
            onClick={() => document.getElementById("upload-input").click()}
            variant="contained"
          >
            {isEdit ? "SAVE" : "POST"}
          </LoadingButton>
        </div>
      </form>
      <Dialog
        open={openTag}
        onClose={() => {
          setOpenTag(false);
          if (isEdit)
            setPosts((prevData) => {
              return prevData.map((data) => {
                if (data._id === postData._id) {
                  return { ...data, tagDetails: [...cloneTag] };
                } else return { ...data };
              });
            });
        }}
        transitionDuration={0}
        maxWidth="100vw"
        PaperProps={{
          style: { borderRadius: "20px", width: "40vw", height: "40vh" },
        }}
      >
        <TagForm
          user={user}
          profile={url}
          tag={tag}
          setTag={setTag}
          setCloneTag={setCloneTag}
          cloneTag={cloneTag}
          postTag={postTag}
          setPostTag={setPostTag}
          setRemovedTag={setRemovedTag}
          removedTag={removedTag}
          postData={postData}
          isEdit={isEdit}
        />
      </Dialog>
    </div>
  );
}
