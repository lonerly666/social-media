const express = require("express");
require("./config/passport-setup");
require("dotenv").config({ path: __dirname + "/./.env" });
const cors = require("cors");
const app = express();
const path = require("path");
const session = require("express-session");
const port = process.env.PORT || 5000;
const inProduction = process.env.NODE_ENV === "production";
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const methodOverride = require('method-override');
const mongoURI = "mongodb://localhost:27017/social-media";
const passport = require("passport");
const passportSocketIo = require("passport.socketio");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");
const notificationRoutes = require("./routes/notification");
const clientP = mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async(m)=>await m.connection.getClient())
const sessionStore = MongoStore.create({
  clientPromise:clientP
});
const sessionMiddleware = session({
  cookie: { httpOnly: false, expires: 259200000 },
  secret: process.env.SESSION_SECRET,
  key: "connect.sid",
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")))
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
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/notification", notificationRoutes);
const server = app.listen(port);
const io = require("socket.io")(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

function onAuthorizeSuccess(data, accept) {
  accept();
}

function onAuthorizeFail(data, message, error, accept) {
  accept(null, false);
}

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "connect.sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
  })
);
app.set("io", io);

io.on("connection", async (socket) => {
  if(socket.request.user._id===undefined)return;
  console.log(socket.request.user.nickname+" has connected");
  const userId = socket.request.user._id? socket.request.user._id.toString():"";
  socket.join(userId);
  socket.on("greet", (userId) => {
    console.log(userId);
    io.emit("back", "Hello");
  });
  socket.on("disconnect", () => {
    console.log("dc");
  });
});
