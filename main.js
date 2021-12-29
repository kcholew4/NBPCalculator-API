import Debug from "debug";
import WebSocket from "ws";
import { validate } from "jsonschema";
import _ from "lodash";
import * as methods from "./methods/index.js";

const debug = Debug("nbpcalculator:main");

const port = process.env.PORT || 3000;

console.log(`port: ${port}`);

const wss = new WebSocket.Server({ port });

const methodsList = {
  GET_RANGE: methods.getRange,
  GET_DISABLED_DAYS: methods.getDisabledDays,
  GET_TABLE: methods.getTable,
};

function handleMessage(ws, message) {
  if (message === "ping") {
    ws.send("pong");
    return;
  }

  let parsedMessage;

  try {
    parsedMessage = JSON.parse(message);
  } catch (error) {
    ws.send(
      JSON.stringify({
        error: "cannot parse message",
      })
    );
    return;
  }

  const messageSchema = {
    type: "object",
    properties: {
      method: {
        type: "string",
      },
      payload: {},
      id: {
        type: "number",
      },
    },
    required: ["method", "id"],
  };

  const { valid } = validate(parsedMessage, messageSchema, { required: true });

  if (!valid) {
    ws.send(
      JSON.stringify({
        error: "invalid message format",
      })
    );
    return;
  }

  const requestedMethod = _.toUpper(parsedMessage.method);

  if (!_.has(methodsList, requestedMethod)) {
    ws.send(
      JSON.stringify({
        error: `"${requestedMethod}" method does not exist`,
      })
    );
    return;
  }

  const method = methodsList[requestedMethod];

  method({
    ws,
    payload: parsedMessage.payload,
    id: parsedMessage.id,
  });
}

wss.on("connection", (ws, req) => {
  let ip;
  if (!req.headers["x-forwarded-for"]) {
    ip = req.socket.remoteAddress;
  } else {
    ip = req.headers["x-forwarded-for"].split(/\s*,\s*/)[0];
  }

  debug(`${ip}: connected`);
  ws.on("message", (message) => handleMessage(ws, message));
});
