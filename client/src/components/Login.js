import "../css/login.css";
import GoogleIcon from "@mui/icons-material/Google";
export default function Login() {
  return (
    <div style={{ overflow: "hidden" }}>
      <div className="login-title"> 
        <h1>MEDIA LOUNGE</h1>
        <p>An app inspired by Facebook</p>
      </div>
      <div className="login-button-div">
        <button
          className="login-button-google"
          onClick={() => {
            window.location.href = "/auth/google";
          }}
        >
          <GoogleIcon />
          <p>
            <b>Google Login</b>
          </p>
        </button>
      </div>
    </div>
  );
}
