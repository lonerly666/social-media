import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [user, setUser] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    axios
      .get("/auth/isLoggedIn")
      .then((res) => res.data)
      .catch((err) => console.log(err))
      .then((res) => {
        if (res.statusCode === 200)
          if (res.message === "/form") window.open(res.message, "_self");
          else if (res.message === "/login") window.open(res.message, "_self");
          else setUser(res.message);
        else if (res.statusCode === 400) alert(res.message);
      });
    return function cancel() {
      ac.abort();
    };
  }, []);

  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}
