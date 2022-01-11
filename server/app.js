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
const cookieParser = require('cookie-parser');
const Socket = require('socket.io');
// const methodOverride = require('method-override');
const mongoURI = "mongodb://localhost:27017/social-media";
const passport = require("passport");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const commentRoutes = require('./routes/comment');
const sessionMiddleware = session({
  cookie: { httpOnly: false,expires: 259200000},
  secret: "jeremy",
  key: "connect.sid",
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: mongoURI,
  }),
  user:"",
});
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
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
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

const server = app.listen(port);
const io = Socket(server,{
  cors:{
    origin:CLIENT_URL,
    methods:["GET","POST","DELETE"]
  }
});
io.on('connection',async(socket)=>{
  console.log("new Connection");


  socket.on('disconnect',()=>{
    console.log('dc');
  })
})
app.use("/auth", authRoutes);
app.use("/user",userRoutes);
app.use("/post",postRoutes);
app.use("/comment",commentRoutes);
