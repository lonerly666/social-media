import { Chip, Avatar } from "@mui/material";
import axios from "axios";
import { useLayoutEffect, useState } from "react";

export default function ChipUsers(props) {
  const { user, setPostTag, setTag } = props;
  const [name, setName] = useState("");
  const [profile, setProfile] = useState("");
  useLayoutEffect(() => {
    const ac = new AbortController();
    if (!user.nickname) {
      const formdata = new FormData();
      formdata.append("userId", user.id);
      axios
        .post("/user/nameAndImage", formdata)
        .then((res) => res.data)
        .catch((err) => console.log(err))
        .then((res) => {
          if (res.statusCode === 200) {
            if (res.message.profileImage) {
              setTag((prevData) => {
                for (let i = 0; i < prevData.length; i++) {
                  if (prevData[i].id === user.id) {
                    prevData[i] = {
                      id: user.id,
                      nickname: res.message.nickname,
                      profile: res.message.profileImage,
                    };
                    return;
                  }
                }
              });
              setProfile(
                URL.createObjectURL(
                  new Blob([new Uint8Array(res.message.profileImage.data)])
                )
              );
            }
            setName(res.message.nickname);
          } else {
            alert(res.message);
          }
        });
    }
    return function cancel() {
      ac.abort();
    };
  }, []);
  function handleDelete() {
    setTag((prevData) => {
      return prevData.filter((data) => {
        return data.id !== user.id;
      });
    });
    setPostTag((prevData) => {
      return prevData.filter((data) => {
        return data !== user.id;
      });
    });
  }
  return (
    <div>
      <Chip
        key={user.id}
        style={{ background: "whitesmoke" }}
        onDelete={handleDelete}
        avatar={
          <Avatar
            alt={user.nickname ? user.nickname : name}
            src={
              user.profile
                ? URL.createObjectURL(
                    new Blob([new Uint8Array(user.profile.data)])
                  )
                : profile
            }
          />
        }
        label={user.nickname ? user.nickname : name}
      />
    </div>
  );
}
