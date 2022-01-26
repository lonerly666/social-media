import io from "socket.io-client";
import Cookies from "js-cookie";
const ENDPOINT = "http://localhost:5000";
export default io(ENDPOINT, {
  query:Cookies.get('connect.sid')&&
    "session_id=" + Cookies.get("connect.sid").replace("s:", "").split(".")[0],
});
// export default io(ENDPOINT);
