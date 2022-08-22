const express = require("express");
const app = express();
const path = require("path");

const mongoose = require("mongoose");

const session = require("express-session");

const passport = require("passport");
const LocalStrategy = require("passport-local"); //using the local strategy to find the user from DB.
const flash = require("connect-flash"); //used to display flash messages.

const User = require("./models/user");
const {isLoggedIn} = require('./middleware')


const http = require('http');
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const Chat = require('./models/chat')



mongoose.connect('mongodb://localhost:27017/twitter')
.then(()=>{
    console.log("Database Connected");
})
.catch((err)=>{
    console.log(err);
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Importing all the Routes

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profileRoutes");
const chatRoutes = require("./routes/chatRoute");

// APIs

const postApiRoute = require("./routes/api/posts");
const { accessSync } = require("fs");

app.use(
  session({
    secret: "I am Vangeance",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use(passport.initialize()); //initializes passport on every route call.
app.use(passport.session()); //allow passport to use express-session.

passport.use(new LocalStrategy(User.authenticate())); //function to authenticate the user

passport.serializeUser(User.serializeUser()); //attach the authenticated user. --> req.user.passport.user.{..}
passport.deserializeUser(User.deserializeUser()); //attach the user in req.user --> req.user.{..}. Can be used in apis directly now to refer user.

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.get("/", isLoggedIn, (req, res) => {
  res.render("home"); //next() for the middleware file.
});

// Using all the Routes
app.use(authRoutes);
app.use(profileRoutes);
app.use(chatRoutes);



// APIs

app.use(postApiRoute);


//Making a connection with socket.io for chat functionality
io.on("connection",(socket)=>{
  console.log("connection established")

  socket.on("send-msg" , async(data)=>{
    io.emit("recived-msg",{
      msg:data.msg,
      user:data.user,
      createdAt: new Date(),
    });
    await Chat.create({content:data.msg , user: data.user})
  })
})



server.listen(8080, () => {
  console.log("Server running at port 8080");
});
