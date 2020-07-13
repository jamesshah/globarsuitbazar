const express = require("express");
const router = express.Router();
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1011603",
  key: "3784f3ae668680287aa1",
  secret: "53de7979547b061721e2",
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
