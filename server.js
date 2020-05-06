// import express from "express";
// import bodyParser from "body-parser";
// import mongoose from "mongoose";
// import expressValidator from "express-validator";
// import { dbURL } from "./src/config/constants";
// import routes from "./src/routes/index";
// const server = new express();

// const http = require("http").createServer(server);
// const io = require("socket.io").listen(http);

// // add middleware to parse the json
// server.use(bodyParser.json());
// server.use(expressValidator());
// server.use(
//   bodyParser.urlencoded({
//     extended: false,
//   })
// );

// //connect the database
// mongoose
//   .connect(dbURL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     routes(server);
//   })
//   .catch((err) => console.log("not connected to db because ", err));

// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("offerCaller", (localDescription) => {
//     console.log("offer", localDescription);
//     socket.broadcast.emit("offerReciever", localDescription);
//   });

//   socket.on("Answer", (localDescription) => {
//     console.log("Answer", localDescription);

//     socket.broadcast.emit("Answer", localDescription);
//   });
//   socket.on("candidate", (candidate) => {
//     console.log("candidate", candidate);

//     socket.broadcast.emit("candidate", candidate);
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

// http.listen(process.env.PORT || 3000);

// https://codesquery.com/build-scalable-nodejs-restapi-using-expressjs/
// https://codesquery.com/build-secure-nodejs-rest-api-using-json-web-token/?fbclid=IwAR06g_VIQZEeG24GtmuUZ1DXCe4DMnCmAZza1iBS3ZnOAs9smxDkZ4zLYrY

const express = require("express");

var io = require("socket.io")({
  path: "/io/webrtc",
});

const app = express();
const port = 8080;

// app.get('/', (req, res) => res.send('Hello World!!!!!'))

//https://expressjs.com/en/guide/writing-middleware.html
// app.use(express.static(__dirname + "/build"));
// app.get("/", (req, res, next) => {
//   res.sendFile(__dirname + "/build/index.html");
// });

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

io.listen(server);

// default namespace
io.on("connection", (socket) => {
  console.log("connected");
  let connectedPeers = new Map();

  console.log(socket.id);
  socket.emit("connection-success", { success: socket.id });

  connectedPeers.set(socket.id, socket);

  socket.on("disconnect", () => {
    console.log("disconnected");
    connectedPeers.delete(socket.id);
  });

  socket.on("offerOrAnswer", (data) => {
    console.log("offer", socket.id);
    socket.broadcast.emit("offerOrAnswer", data.payload);
    // send to the other peer(s) if any
    // for (const [socketID, socket] of connectedPeers.entries()) {
    //   // don't send to self
    //   if (socketID !== data.socketID) {
    //     console.log(socketID, data.payload.type);
    //     socket.emit("offerOrAnswer", data.payload);
    //   }
    // }
  });

  socket.on("candidate", (data) => {
    // send candidate to the other peer(s) if any
    socket.broadcast.emit("candidate", data.payload);
    // for (const [socketID, socket] of connectedPeers.entries()) {
    //   // don't send to self
    //   if (socketID !== data.socketID) {
    //     console.log(socketID, data.payload);
    //     socket.emit("candidate", data.payload);
    //   }
    // }
  });
});

// https://www.tutorialspoint.com/socket.io/socket.io_namespaces.htm
const peers = io.of("/webrtcPeer");

// keep a reference of all socket connections

peers.on("connection", (socket) => {});
