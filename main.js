import Debug from "debug";
import http from "http";
import { Server } from "socket.io";

import registerTableHandlers from "./tableHandler.js";

const debug = Debug("nbpcalculator:main");

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
