const debug = require("debug")("nbpcalculator:main");
const WebSocket = require("ws");
const { validate } = require("jsonschema");
const _ = require("lodash");
const methods = require("./methods");

const port = process.env.PORT || 3000;

console.log(`port: ${port}`);

const wss = new WebSocket.Server({ port });

const methodsList = {
  GET_RANGE: methods.getRange,
  GET_DISABLED_DAYS: methods.getDisabledDays,
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
      id: {
        type: "number",
      },
    },
    required: ["method", "id"],
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

  method({
    ws,
    payload: parsedMessage.payload,
    id: parsedMessage.id,
  });
}

wss.on("connection", (ws, req) => {
  debug(`${req.socket.remoteAddress}: connected`);
  ws.on("message", (message) => handleMessage(ws, message));
});
