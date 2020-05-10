import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import expressValidator from "express-validator";
import { dbURL } from "./src/config/constants";
import routes from "./src/routes/index";

const server = new express();
const io = require("socket.io")({
  path: "/io/webrtc",
});

// add middleware to parse the json
server.use(bodyParser.json());
server.use(expressValidator());
server.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

//connect the database
mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    routes(server);
  })
  .catch((err) => console.log("not connected to db because ", err));

io.on("connection", (socket) => {
  let callerSocketId = null;
  let recieverSocketId = null;

  console.log("connected");
  // let connectedPeers = new Map();
  console.log(socket.id);

  socket.emit("connection-success", { socketId: socket.id });
  // connectedPeers.set(socket.id, socket);

  socket.on("recieverCallResponse", (payload) => {
    callerSocketId = payload.callerSocketId;
    recieverSocketId = payload.recieverSocketId;
    io.to(payload.callerSocketId).emit("recieverCallResponse", payload);
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    // connectedPeers.delete(socket.id);

    if (socket.id === callerSocketId && recieverSocketId !== null) {
      io.to(recieverSocketId).emit("socketDisconnected");
    } else if (socket.id === recieverSocketId && callerSocketId !== null) {
      io.to(callerSocketId).emit("socketDisconnected");
    }
  });

  socket.on("offerOrAnswer", (payload) => {
    callerSocketId = payload.callerSocketId;
    recieverSocketId = payload.recieverSocketId;
    if (payload.caller === true) {
      io.to(payload.recieverSocketId).emit("offerOrAnswer", payload);
    } else {
      io.to(payload.callerSocketId).emit("offerOrAnswer", payload);
    }
  });

  socket.on("candidate", (payload) => {
    if (payload.caller === true) {
      io.to(payload.recieverSocketId).emit("candidate", payload.candidate);
    } else {
      io.to(payload.callerSocketId).emit("candidate", payload.candidate);
    }
  });

  socket.on("endCall", (payload) => {
    if (payload.caller === true) {
      io.to(payload.recieverSocketId).emit("endCall");
    } else {
      io.to(payload.callerSocketId).emit("endCall");
    }
  });

  socket.on("cancelCall", (payload) => {
    if (payload.caller === true) {
      io.to(payload.recieverSocketId).emit("cancelCall");
    } else {
      io.to(payload.callerSocketId).emit("cancelCall");
    }
  });
});

const serverListen = server.listen(process.env.PORT || 5000, () =>
  console.log(`Server listening on port 5000!`)
);

io.listen(serverListen);

// https://codesquery.com/build-scalable-nodejs-restapi-using-expressjs/
// https://codesquery.com/build-secure-nodejs-rest-api-using-json-web-token/?fbclid=IwAR06g_VIQZEeG24GtmuUZ1DXCe4DMnCmAZza1iBS3ZnOAs9smxDkZ4zLYrY
