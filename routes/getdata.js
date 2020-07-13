const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const Message = require("../models/Message");

router.get("/logs", (req, res) => {
  Log.find((err, logs) => {
    if (err) res.send(err);
    else res.json(logs);
  });
});

router.get("/messages", (req, res) => {
  Message.find((err, messages) => {
    if (err) res.send(err);
    else res.json(messages);
  });
});

module.exports = router;
