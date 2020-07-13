const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", (req, res) => {
  res.render(path.join(path.join(path.dirname(__dirname), "views/email")));
});

module.exports = router;
