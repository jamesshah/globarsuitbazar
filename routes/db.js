const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const Message = require("../models/Message");
const { checkAdmin } = require("../middlewares/auth");

router.post("/log", async (req, res) => {
  console.log(req.body);

  const log = new Log({
    agentName: req.body.agentName,
    userName: req.body.userName,
    answered: req.body.answered,
  });
  const addlog = await log.save();
  res.json({ msg: "Log Added" });
});

router.post("/message", async (req, res) => {
  const message = new Message({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  });
  const addmsg = await message.save();
  res.json({ msg: "Mail Received" });
});

router.put("/log/:userName", async (req, res) => {
  try {
    console.log();
    const log = await Log.findOneAndUpdate(
      { userName: req.params.userName },
      { endTime: new Date() },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json({ msg: log });
  } catch (error) {
    console.error(error);
    res.json(error);
  }
});

router.get("/log", checkAdmin, (req, res) => {
  Log.find((err, logs) => {
    if (err) res.send(err);
    else res.json(logs);
  });
});

router.get("/message", checkAdmin, (req, res) => {
  Message.find((err, messages) => {
    if (err) res.send(err);
    else res.json(messages);
  });
});

module.exports = router;
