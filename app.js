const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const connectDB = require("./config/connectDb");
require("dotenv").config();
const path = require("path");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    originalMaxAge: 10000,
  })
);

// Connect to mongodb database
connectDB();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("view engine", "ejs");

// Routes
app.use("/", require("./routes/index"));
app.use("/video", require("./routes/video"));
app.use("/token", require("./routes/token"));
app.use("/agents", require("./routes/agents"));
app.use("/pusher/auth", require("./routes/pusherAuth"));
app.use("/db", require("./routes/db"));
app.use("/email", require("./routes/email"));
app.use("/message", require("./routes/message"));
app.use("/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server up and listening on port ${PORT}`);
});
