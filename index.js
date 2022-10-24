const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

var gatherHost;

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

function gatherDisconnected(socket) {
  gatherHost = null;
  socket.broadcast.emit("hostDisconnected");
  socket.broadcast.emit("noCalls");
  socket.broadcast.emit("players", []);
}

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", function () {
    if (gatherHost?.id == socket.id) {
      gatherDisconnected(socket);
    }
  });
  //   from client
  socket.on("gatherHost", function () {
    console.log("host connected");
    socket.broadcast.emit("hostConnected");
    gatherHost = socket;
  });
  socket.on("removeHost", function () {
    console.log("host removed");
    gatherDisconnected(socket);
  });
  socket.on("incomingCall", function (people) {
    socket.broadcast.emit("incomingCall", people);
  });
  socket.on("noCalls", function (people) {
    socket.broadcast.emit("noCalls");
  });
  socket.on("players", function (p) {
    socket.broadcast.emit("players", p);
  });
  socket.on("gatherRemoteFn", function (options) {
    if (!gatherHost) {
      return;
    }
    io.to(gatherHost.id).emit("gatherRemoteFn", options);
  });
  socket.on("success", function () {
    socket.broadcast.emit("success");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
