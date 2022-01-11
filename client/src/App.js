import { Route, Switch } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Home from "./components/Home";
import UserForm from "./components/UserForm";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function App(props) {
  const ENDPOINT = "http://localhost:5000";
  const socket = useRef();
  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    const ac = new AbortController();
    if (firstLoad) {
      socket.current = io(ENDPOINT);
      setFirstLoad(false);
    }
    return function cancel() {
      ac.abort();
    };
  }, []);
  return (
    <main>
      <Switch>
        <Route path="/" exact>
          <Home socket={socket} />
        </Route>
        <Route path="/login" exact component={Login} />
        <Route path="/form" exact component={UserForm} />
        <Route
          path="/:userId"
          exact
          render={(props) => {
            return <Home userId={props.match.params.userId} socket={socket}/>;
          }}
        />
      </Switch>
    </main>
  );
}
