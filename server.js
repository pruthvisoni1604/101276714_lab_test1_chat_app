const app = require("express")();
const http = require("http").createServer(app);
const { Console } = require("console");
const cors = require("cors");
const PORT = 3000;
const express = require("express");
const mongoose = require("mongoose");

const userModel = require(__dirname + "/models/User");
const gmModel = require(__dirname + "/models/GroupMessage");
const pmModel = require(__dirname + "/models/PrivateMessage");

const io = require("socket.io")(http);

app.use(cors());
users = [];

io.on("connection", (socket) => {
  console.log(`${socket.id} Connected`);

  socket.emit("welcome", "Welcome to Socket Programming : " + socket.id);

  socket.on("message", (data) => {
    if (data.room == "" || data.room == undefined) {
      io.emit("newMessage", socket.id + " : " + data.message);
    } else {
      io.to(data.room).emit("newMessage", socket.id + " : " + data.message);
      if (
        data.room == "news" ||
        data.room == "covid" ||
        data.room == "nodeJs"
      ) {
        const gm = new gmModel({
          from_user: socket.id,
          room: data.room,
          message: data.message,
        });
        try {
          gm.save();
        } catch (err) {
          console.log(err);
        }
      } else {
        const pm = new pmModel({
          from_user: socket.id,
          to_user: room,
          message: data.message,
        });
        try {
          pm.save();
        } catch (err) {
          console.log(err);
        }
      }
    }
  });

  socket.on("newUser", (name) => {
    if (!users.includes(name)) {
      users.push(name);
    }
    socket.id = name;
  });

  socket.on("userTyping", (data) => {
    socket.broadcast.to(data.room).emit("showChatUI", data.username);
  });

  socket.on("joinroom", (room) => {
    socket.join(room);
    roomName = room;
    socket.currentRoom = room;
    const msg = gmModel
      .find({ room: room })
      .sort({ date_sent: "desc" })
      .limit(10);
    socket.msg = msg;
  });

  socket.on("leaveRoom", () => {
    socket.leave(socket.currentRoom);
    socket.currentRoom = null;
    console.log(socket.rooms);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
});

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

//TODO - Replace you Connection String here
mongoose
  .connect(
    "mongodb+srv://gbc:pruthvi@sa.dubue.mongodb.net/db_f2021_comp3123?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((success) => {
    console.log("Success Mongodb connection");
  })
  .catch((err) => {
    console.log("Error Mongodb connection");
  });

//http://localhost:3000/signup
app.get("/signup", async (req, res) => {
  res.sendFile(__dirname + "/html/signup.html");
});

//http://localhost:3000/login
app.get("/login", async (req, res) => {
  res.sendFile(__dirname + "/html/login.html");
});
app.post("/login", async (req, res) => {
  const user = new userModel(req.body);
  try {
    await user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          return res.redirect("/signup?err=username");
        }
        res.send(err);
      } else {
        return res.redirect("/login");
      }
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

//http://localhost:3000/
app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/html/index.html");
});
app.post("/", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await userModel.find({ username: username });

  try {
    if (user.length != 0) {
      if (user[0].password == password) {
        return res.redirect("/?uname=" + username);
      } else {
        return res.redirect("/login?wrong=pass");
      }
    } else {
      return res.redirect("/login?wrong=uname");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//http://localhost:3000/chat/covid
app.get("/chat/:room", async (req, res) => {
  const room = req.params.room;
  const msg = await gmModel
    .find({ room: room })
    .sort({ date_sent: "desc" })
    .limit(10)
    .select("from_user message date_sent");
  console.log(msg);
  res.sendFile(__dirname + "/html/chat.html");
});

app.post("/chat", async (req, res) => {
  const username = req.body.username;
  const user = await userModel.find({ username: username });
  if (user[0].username == username) {
    return res.redirect("/chat/" + username);
  } else {
    return res.redirect("/?err=noUser");
  }
});

http.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
