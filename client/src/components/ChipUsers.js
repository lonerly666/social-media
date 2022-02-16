import { Chip, Avatar } from "@mui/material";

export default function ChipUsers(props) {
  const { user, setPostTag, setTag, tag, setRemovedTag, postData } = props;
 
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
    if (postData.tags.includes(user.id)) {
      setRemovedTag((prevData) => {
        return [...prevData, user.id];
      });
    }
  }
  return (
    <div>
      <Chip
        key={user.id}
        style={{ background: "whitesmoke" }}
        onDelete={handleDelete}
        avatar={
          <Avatar
            alt={user.nickname && user.nickname}
            src={
              user.profile
                ? URL.createObjectURL(
                    new Blob([new Uint8Array(user.profile.data)])
                  )
                : ""
            }
          />
        }
        label={user.nickname && user.nickname}
      />
    </div>
  );
}
