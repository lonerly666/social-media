const express = require('express');
const CLIENT_URL = "http://localhost:3000";
const cors = require("cors");
const app = express();
const port = 5000;

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(
    cors({
      origin: CLIENT_URL,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true
    })
);

app.listen(port)
