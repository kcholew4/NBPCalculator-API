import Debug from "debug";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

import registerTableHandlers from "./tableHandler.js";

const debug = Debug("nbpcalculator:main");

try {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
  console.log("Connected to the database");
} catch (error) {
  debug("couldn't connect to the database");
  process.exit(1);
}

const server = http.createServer();
const io = new Server(server, { cors: {} });

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Listening on port ${port}`));

io.on("connection", (socket) => {
  debug(`ip: ${socket.handshake.address} connected`);

  socket.use(([event, ...args], next) => {
    if (typeof args.at(-1) !== "function") {
      return next(new Error("not an acknowledgement"));
    }

    next();
  });

  socket.on("error", (error) => {
    if (error) {
      debug(error.message);
    }

    socket.disconnect();
  });

  registerTableHandlers(io, socket);
});
