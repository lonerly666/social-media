import { NavLink } from "react-router-dom";

export default function Liker(props) {
  const { Avatar, liker, profile, user,setShowPost } = props;
  return (
    <div className="liker-details-div">
      <div className="like-avatar-div">
        <NavLink to={"/" + liker.id} style={{ width: "100%", height: "100%" }} onClick={()=>typeof(setShowPost)==='function'&&setShowPost(false)}>
          <Avatar
            id="like-avatar-photo"
            src={
              liker.id === user._id
                ? profile
                : liker.image
                ? URL.createObjectURL(
                    new Blob([new Uint8Array(liker.image.data)])
                  )
                : ""
            }
          />
        </NavLink>
      </div>
      <div className="likers-name-div">
        <NavLink
          to={"/" + liker.id}
          style={{ textDecoration: "none", color: "black" }}
          onClick={()=>typeof(setShowPost)==='function'&&setShowPost(false)}
        >
          <p className="liker-name">
            {liker.id === user._id ? user.nickname : liker.nickname}
          </p>
        </NavLink>
      </div>
    </div>
  );
}
