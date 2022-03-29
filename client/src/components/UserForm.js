import "../css/userForm.css";
import { useLayoutEffect, useEffect, useState, useRef } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import { LoadingButton } from "@mui/lab";
import Avatar from "@mui/material/Avatar";
import Cropper from "react-avatar-editor";
import { NavLink } from "react-router-dom";
import Photo from "@mui/icons-material/PhotoCamera";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Slider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Select from "react-select";
const pica = require("pica/dist/pica.min")();

export default function UserForm() {
  const [nickname, setNickName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [sending, setSending] = useState(false);
  const [image, setImage] = useState({
    original: null,
    originalBuffer: null,
    cropped: null,
    croppedBuffer: null,
    coord: {
      x: 0.5,
      y: 0.5,
    },
    scale: 1,
  });
  const [newCropped, setCrop] = useState({
    url: null,
    file: null,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [moved, setMoved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cropSize, setCropSize] = useState({
    height: 300,
    width: 300,
  });
  const [imageDetails, setImageDetails] = useState({
    scale: 1,
    coord: {
      x: 0.5,
      y: 0.5,
    },
  });
  const editor = useRef();
  useLayoutEffect(() => {
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
            console.log(temp);
            setNickName(temp.nickname);
            setBio(temp.bio);
            setGender(temp.gender);
            setDob(temp.dateOfBirth);
            setImage((prevData) => {
              return {
                ...prevData,
                scale: temp.imageDetails.scale,
                coord: temp.imageDetails.coord,
              };
            });
            setImageDetails((prevData) => {
              return {
                scale: temp.imageDetails.scale,
                coord: temp.imageDetails.coord,
              };
            });
            if (temp.profileImage) {
              const imgUrl = URL.createObjectURL(
                new Blob([new Uint8Array(temp.profileImage.data)])
              );
              setCrop(imgUrl);
              setImage((prevData) => {
                return { ...prevData, cropped: imgUrl };
              });
            }
          } else if (res.statusCode === 400) alert(res.message);
      })
      .then(() => setLoaded(true));
    return function cancel() {
      ac.abort();
    };
  }, []);
  useEffect(() => {
    const ac = new AbortController();
    if (window.screen.height <= 727) {
      setCropSize({
        height: 200,
        width: 200,
      });
    }
    return () => {
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function saveInfo(event) {
    event.preventDefault();
    const formdata = new FormData();
    const file = event.target.fileId.files[0];
    if (file) {
      if (file.size > 500000) {
        alert("File too big to handle!");
        return;
      }
    }
    await axios.delete("/user/profile")
    .then(res=>res.data)
    .catch(err=>console.log(err))
    .then(res=>{
      if(res.statusCode){
        alert(res.message);
      }
    })
    // setSending(true);
    addInfo(formdata);
  }
  async function addInfo(formdata) {
    formdata.append("nickname", nickname);
    formdata.append("gender", gender);
    formdata.append("dateOfBirth", dob);
    formdata.append("bio", bio);
    formdata.append("profiles", newCropped.file);
    formdata.append("profiles", image.originalBuffer);
    formdata.append("imageDetails", JSON.stringify(imageDetails));
    // formdata.append("cropped", newCropped.file);
    // formdata.append("original", image.originalBuffer);
    await axios({
      method: "POST",
      url: "/user/info",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200) {
          document.getElementById("navi").click();
        }
      });
  }

  async function cropImg() {
    const MAX_WIDTH = 250;
    const MAX_HEIGHT = 250;
    const SMALL_HEIGHT = 50;
    const SMALL_WIDTH = 50;
    const MIME_TYPE = image.originalBuffer.type;
    const cropped = editor.current.getImage();
    var mediumSize = document.createElement("canvas");
    mediumSize.height = MAX_HEIGHT;
    mediumSize.width = MAX_WIDTH;
    var smallSize = document.createElement("canvas");
    smallSize.height = SMALL_HEIGHT;
    smallSize.width = SMALL_WIDTH;
    const mediumPica = await pica.resize(cropped, mediumSize);
    const smallPica = await pica.resize(cropped, smallSize);
    smallPica.toBlob(
      (blob) => {
        const smallFile = new File([blob], "small");
      },
      "image/jpeg",
      0.9
    );
    mediumPica.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        setCrop({
          url: url,
          file: new File([blob], "medium", { type: MIME_TYPE }),
        });
      },
      "image/jpeg",
      0.9
    );
  }
  async function deleteUser() {
    document.getElementById("cancel-delete").style.display = "none";
    setIsDeleting(true);
    await axios
      .delete("/user/")
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === "400") {
          alert(
            "Ooops something wrong with the server, please try again later"
          );
          setIsDeleting(false);
          return;
        } else {
          alert("Account deleted successfully");
          document.getElementById("navi-login").click();
        }
      });
  }
  return loaded ? (
    <div className="userForm">
      <form onSubmit={saveInfo}>
        <NavLink to="/" id="navi" hidden />
        <NavLink to="/login" id="navi-login" hidden />
        <input
          hidden
          id="upload"
          type="file"
          className="upload"
          name="fileId"
          accept="image/*"
          onChange={(e) => {
            const url = URL.createObjectURL(e.target.files[0]);
            const file = e.target.files[0];
            setImage((prevData) => {
              return {
                ...prevData,
                original: url,
                cropped: url,
                originalBuffer: new File([file], "original", {
                  type: file.type,
                }),
              };
            });
          }}
        />
        <div className="avatar-div">
          {nickname && (
            <div className="sign-div">
              <h1>{nickname} .</h1>
            </div>
          )}
          <div className="avatar-holder">
            <Avatar
              alt="Profile"
              id="profile"
              src={newCropped.url}
              style={{ width: 250, height: 250, background: "gray" }}
              onClick={() => document.getElementById("upload").click()}
            />
            <button
              id="upload-cam"
              type="button"
              onClick={() => document.getElementById("upload").click()}
            >
              <Photo />
            </button>
          </div>
          <div className="profile-div">
            <h1>PROFILE</h1>
          </div>
        </div>
        {image.original && (
          <div className="cropper-div">
            <Cropper
              id="editor"
              ref={editor}
              style={{ maxWidth: "100%" }}
              height={cropSize.height}
              width={cropSize.width}
              image={image.original}
              borderRadius={400}
              onLoadSuccess={cropImg}
              scale={imageDetails.scale}
              color={[255, 255, 255, 0.6]}
              position={imageDetails.coord}
              onMouseUp={cropImg}
              onPositionChange={(coord) => {
                setImageDetails((prevData) => {
                  return {
                    ...prevData,
                    coord: {
                      x: coord.x,
                      y: coord.y,
                    },
                  };
                });
                setMoved(true);
              }}
            />
            <div className="option-div">
              <div className="zoomer-title">
                <h3>Zoom</h3>
              </div>
              <div className="zoomer-div">
                <Slider
                  id="zoomer"
                  size="small"
                  defaultValue={50}
                  value={(imageDetails.scale - 1) * 100}
                  aria-label="Zoom"
                  onChange={(e) => {
                    setImageDetails((prevData) => {
                      return { ...prevData, scale: 1 + e.target.value / 100 };
                    });
                    setMoved(true);
                  }}
                  onChangeCommitted={cropImg}
                />
              </div>
              <div className="undo-div">
                {moved && (
                  <Button
                    onClick={() => {
                      setMoved(false);
                      setCrop({
                        url: image.cropped,
                        file: image.croppedBuffer,
                      });
                      setImageDetails({
                        scale: image.scale,
                        coord: image.coord,
                      });
                    }}
                    color="success"
                    variant="contained"
                    style={{ background: "rgb(88, 146, 88)" }}
                  >
                    <ReplayIcon />
                    Revert
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="details-div">
          <div className="row">
            <span>
              <input
                className="swing name"
                id="name"
                type="text"
                placeholder="Your Name"
                value={nickname}
                onChange={(e) => setNickName(e.target.value)}
                autoComplete="off"
              />
              <label htmlFor="name">Name</label>
            </span>
          </div>
          <div className="gender-div">
            <Select
              options={[
                {
                  value: "Male",
                  label: "Male",
                },
                {
                  value: "Female",
                  label: "Female",
                },
                {
                  value: "Other",
                  label: "Other",
                },
              ]}
              onChange={(e) => {
                setGender(e.value);
              }}
              defaultValue={{ value: gender, label: gender }}
              id="select"
              isSearchable={false}
            />
          </div>
        </div>
        <div className="bio-div">
          <div className="row">
            <span>
              <textarea
                maxLength={50}
                className="swing bio"
                id="bio"
                type="text"
                placeholder="BIO"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{
                  height: "10vh",
                  width: "30vw",
                  padding: "120px 50px 20px 50px",
                  textAlign: "fit-content",
                  animation: "none",
                  overflowWrap: "break-word",
                  resize: "none",
                  color: "black",
                }}
                autoComplete="off"
              ></textarea>
              <label
                htmlFor="name"
                style={{
                  width: "100%",
                  padding: 0,
                  height: "5vh",
                  borderRadius: "2px",
                  animation: "none",
                }}
              >
                Bio
              </label>
            </span>
          </div>
        </div>
        <div className="date-div">
          <div className="date-holder">
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              name="dateOfBirth"
              id="date"
            >
              <DatePicker
                id="dates"
                label="Date Of Birth"
                views={["year", "month", "day"]}
                value={dob}
                onChange={(e) => {
                  setDob(e);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </div>
        </div>
        <div className="submit-div">
          <LoadingButton
            style={{
              width: "10vw",
              height: "5vh",
              background: "#7AB893",
              color: "whitesmoke",
            }}
            type="submit"
            loading={sending}
            variant="contained"
          >
            {!sending && "Save"}
          </LoadingButton>
          {isEdit && (
            <Button
              variant="contained"
              id="cancel"
              onClick={() => document.getElementById("navi").click()}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
      {isEdit && (
        <div className="delete-div">
          <Button
            variant="contained"
            onClick={() => setIsDelete(true)}
            id="delete-btn"
          >
            Delete Account
          </Button>
          <Dialog
            open={isDelete}
            keepMounted
            onClose={() => setIsDelete(false)}
            aria-describedby="delete-acc-alert"
          >
            <DialogTitle
              className="delete-msg title"
              style={{ fontSize: "30px", fontWeight: "bold" }}
            >
              {<p>Whoa! Stop right there!</p>}
            </DialogTitle>
            <DialogContent className="delete-msg">
              <DialogContentText
                id="alert-dialog-slide-description"
                style={{
                  textAlign: "center",
                  fontSize: "18px",
                  color: "black",
                }}
              >
                Are you sure you want to delete your account? Your data and your
                account will be deleted forever! Think twice my friend.
              </DialogContentText>
            </DialogContent>
            <DialogActions
              className="delete-msg"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Button
                onClick={() => setIsDelete(false)}
                variant="contained"
                id="cancel-delete"
              >
                Nope
              </Button>
              <LoadingButton
                onClick={deleteUser}
                variant="contained"
                id="agree-delete"
                loading={isDeleting}
              >
                Delete
              </LoadingButton>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  ) : (
    <div></div>
  );
}
