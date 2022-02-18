import { Chip, Avatar } from "@mui/material";

export default function ChipUsers(props) {
  const { user, setPostTag, setTag, setRemovedTag, postData } = props;
  function handleDelete() {
    setTag((prevData) => {
      return prevData.filter((data) => {
        return data._id !== user._id;
      });
    });
    setPostTag((prevData) => {
      return prevData.filter((data) => {
        return data !== user._id;
      });
    });
    if (postData.tags.includes(user._id)) {
      setRemovedTag((prevData) => {
        return [...prevData, user._id];
      });
    }
  }
  return (
    <div>
      <Chip
        key={user._id}
        style={{ background: "whitesmoke" }}
        onDelete={handleDelete}
        avatar={
          <Avatar
            alt={user.nickname && user.nickname}
            src={
              user.profileImage
                ? URL.createObjectURL(
                    new Blob([new Uint8Array(user.profileImage.data)])
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
