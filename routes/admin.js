const express = require("express");
const router = express.Router();
const path = require("path");
const { checkAdmin } = require("../middlewares/auth");

router.get("/", checkAdmin, (req, res) => {
  res.render(path.join(path.join(path.dirname(__dirname), "views/admin")));
});

router.get("/login", (req, res) => {
  res.render(path.join(path.dirname(__dirname), "views/adminLogin"), {
    message: "Please login to access admin panel",
  });
});

router.post("/login", (req, res) => {
  // console.log(req.body);
  if (!req.body.userid || !req.body.password) {
    res.render(path.join(path.dirname(__dirname), "views/adminLogin"), {
      message: "Plese Enter User ID and Password.",
    });
  } else {
    if (
      req.body.userid == process.env.ADMIN_ID &&
      req.body.password == process.env.ADMIN_PASS
    ) {
      req.session.admin = { id: req.body.userid };
      res.redirect(`./`);
    } else {
      res.render(path.join(path.dirname(__dirname), "views/adminLogin"), {
        message: "Plese enter valid userid and password.",
      });
    }
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => console.log("user logged out. session destroyed."));
  res.redirect("./login");
});

module.exports = router;
