import "../css/onlineList.css";
import OnlineUser from "./OnlineUser";
export default function OnlineList(props) {
  const { user } = props;

  return (
    <div className="ol-div">
      <div className="ol-title">
        <h3>Friends Online</h3>
      </div>
      <div className="ol-scrollable">
        {user.map((data) => {
          return <OnlineUser key={data._id} user={data} />;
        })}
      </div>
    </div>
  );
}
