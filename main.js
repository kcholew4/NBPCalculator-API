import Debug from "debug";
import { Server } from "socket.io";

import registerTableHandlers from "./handlers/table.js";

const debug = Debug("nbpcalculator:main");

const port = process.env.PORT || 3000;

console.log(`port set to: ${port}`);

const io = new Server(port, { cors: {} });

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
