const express = require("express");
require("./config/passport-setup");
require("dotenv").config({ path: __dirname + "/./.env" });
const cors = require("cors");
const app = express();
const session = require("express-session");
const port = process.env.PORT || 5000;
const inProduction = process.env.NODE_ENV === "production";
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const methodOverride = require('method-override');
const mongoURI = "mongodb://localhost:27017/social-media";
const passport = require("passport");
const authRoutes = require("./routes/auth");
const sessionMiddleware = session({
  cookie: { httpOnly: false },
  secret: "eet2jd883dx",
  key: "connect.sid",
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: mongoURI,
  }),
});

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  cors({
    origin: CLIENT_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.listen(port);

app.use("/auth", authRoutes);
