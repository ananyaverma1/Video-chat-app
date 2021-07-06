const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
//

/*const { auth } = require('express-openid-connect');
require('dotenv').config()
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL:process.env.BASEURL,
  clientID: process.env.CLIENTID,
  issuerBaseURL: process.env.ISSUER
};*/
//
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));
//
//app.use(auth(config));

//

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    });
  });
});

server.listen(process.env.PORT || 3030);
