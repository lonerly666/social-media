import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { NavLink } from "react-router-dom";

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
          if (res.message === "/login") window.open(res.message, "_self");
          else{
            if(res.message.nickname===undefined)window.open('/form','_self');
            setUser(res.message);
          }
        else if (res.statusCode === 400) alert(res.message);
      });
    return function cancel() {
      ac.abort();
    };
  }, []);
  return (
    <div>
      <h1>Hello World</h1>
      <NavLink to='/form' draggable={false}><Button>FORM</Button></NavLink>
    </div>
  );
}
