const express = require("express");
const router = express.Router();
const Pusher = require("pusher");
require("dotenv").config();

const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "ap2",
});

router.post("/", async (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const presenceData = {
    user_id: "",
  };

  if (req.session.user) {
    console.log(req.session.user.id);
    presenceData.user_id = req.session.user.id;
  } else {
    let timestamp = new Date().toISOString();
    presenceData.user_id = `user-${timestamp}`;
  }
  // const presenceData = {
  //   user_id: userid,
  //   user_info: {
  //     name: userid,
  //   },
  // };
  const auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});

module.exports = router;
