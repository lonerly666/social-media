const express = require('express');
require('dotenv').config({path: __dirname + '/./.env'});
const CLIENT_URL = "http://localhost:3000";
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const inProduction = process.env.NODE_ENV === "production";
const CLIENT_URL = inProduction ? process.env.DOMAIN_NAME : "http://localhost:3000";
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoURI = "mongodb://localhost:27017/social-media"
const passport = require('passport');

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
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

mongoose.connect(mongoURI,{
  useNewUrlParser:true,
  useUnifiedTopology:true
});
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);


app.listen(port)
