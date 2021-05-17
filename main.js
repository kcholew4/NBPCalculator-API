const WebSocket = require("ws");
const { validate } = require("jsonschema");
const _ = require("lodash");
const methods = require("./methods");

const wss = new WebSocket.Server({ port: 8080 });

const methodsList = {
  GET_RANGE: methods.getRange,
  GET_AVAILABLE_DAYS: methods.getAvailableDays,
  GET_RATES: methods.getRates,
};

function handleMessage(ws, message) {
  let parsedMessage;

  try {
    parsedMessage = JSON.parse(message);
  } catch (error) {
    ws.send("it's not valid json");
    return;
  }

  const messageSchema = {
    type: "object",
    properties: {
      method: {
        type: "string",
      },
      payload: {},
    },
    required: ["method"],
  };

  const { valid } = validate(parsedMessage, messageSchema, { required: true });

  if (!valid) {
    ws.send("invalid format");
    return;
  }

  const requestedMethod = _.toUpper(parsedMessage.method);

  if (!_.has(methodsList, requestedMethod)) {
    ws.send(`"${requestedMethod}" method does not exist`);
    return;
  }

  const method = methodsList[requestedMethod];
  method(ws, parsedMessage.payload);
}

wss.on("connection", (ws, req) => {
  console.log(`${req.socket.remoteAddress}: connected`);

  ws.on("message", (message) => handleMessage(ws, message));
});
