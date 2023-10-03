const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { default: axios } = require("axios");

const app = express();
const token = process.env.TOKEN;
const myToken = process.env.MYTOKEN

const router = express.Router();

//logs the server
app.use(morgan("dev"));
//parse url and json request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//allow cross origin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    Response.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, PATCH, DELETE, GET"
    );
    return res.status(200).json({});
  }
  next();
});

app.get("/", (req, res, next) => {
  res.status(200).json({
    code: "201",
    message: "Whatsapp web api",
    data: { name: "james" },
  });
});

app.get("/webhook", (req, res, next) => {
  let mode = req.query("hub.mode");
  let challenge = req.query("hub.challenge");
  let token = req.query("hub.verify_token");

  if (mode && token) {
    if (mode === "subscribe" && token === myToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res, next) => {
  let body_params = req.body;
  console.log(JSON.stringify(body_params, null, 2));

  if (body_params.object) {
    if (
      body_params.entry &&
      body_params.entry[0].changes[0].value.messages &&
      body_params.entry[0].changes[0].value.messages[0]
    ) {
      let phone_numhber_id =
        body_params.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_params.entry[0].changes[0].value.messages[0].from;
      let msg_body =
        body_params.entry[0].changes[0].value.messages[0].text.body;

      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v17.0/" +
          phone_numhber_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "Hi.. I am James",
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      res.sendStatus(200);
    }else{
        res.sendStatus(404)
    }
  }
});

//handling errors
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
