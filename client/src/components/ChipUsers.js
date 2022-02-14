import { Chip, Avatar } from "@mui/material";
import axios from "axios";
import { useLayoutEffect, useState } from "react";

export default function ChipUsers(props) {
  const { user, setPostTag, setTag, tag } = props;
  const [name, setName] = useState("");
  const [profile, setProfile] = useState("");
  useLayoutEffect(() => {
    const ac = new AbortController();
    if (!user.nickname) {
      const temp = [];
      async function updateComponent() {
        await Promise.all(
          tag.map(async (data) => {
            const formdata = new FormData();
            formdata.append("userId", data.id);
            await axios
              .post("/user/nameAndImage", formdata)
              .then((res) => res.data)
              .catch((err) => console.log(err))
              .then((res) => {
                if (res.statusCode === 200) {
                  temp.push({
                    id: data.id,
                    nickname: res.message.nickname,
                    profile: res.message.profileImage,
                  });
                } else {
                  alert(res.message);
                }
              });
          })
        );
        setTag([...temp]);
      }
      updateComponent();
    }
    return () => {
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
