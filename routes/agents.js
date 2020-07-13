const express = require("express");
const router = express.Router();
const path = require("path");
const { checkAgent } = require("../middlewares/auth");

router.get("/", checkAgent, (req, res) => {
  res.render(path.join(path.join(path.dirname(__dirname), "views/agent")), {
    name: req.session.user.id,
  });
});

router.get("/login", (req, res) => {
  res.render(path.join(path.dirname(__dirname), "views/agentLogin"), {
    message: "Please login to access agent's page. ",
  });
});

router.post("/login", (req, res) => {
  // console.log(req.body);
  if (!req.body.userid || !req.body.password) {
    res.status("401");
    res.send("Unauthorized");
  } else {
    if (
      req.body.userid == process.env.AGENT_ONE_ID &&
      req.body.password == process.env.AGENT_ONE_PASS
    ) {
      req.session.user = { id: req.body.userid };
      res.status("200");
      res.redirect(`./`);
    } else if (
      req.body.userid == process.env.AGENT_TWO_ID &&
      req.body.password == process.env.AGENT_TWO_PASS
    ) {
      req.session.user = { id: req.body.userid };
      res.status("200");
      res.redirect(`./`);
    } else {
      res.render(path.join(path.dirname(__dirname), "views/agentLogin"), {
        message: "Please enter valid user id and password.",
      });
    }
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => console.log("user logged out. session destroyed."));
  res.redirect("./login");
});

module.exports = router;
