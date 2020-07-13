const mongoose = require("mongoose");

const LogSchema = mongoose.Schema({
  agentName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  answered: {
    type: Boolean,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
});

module.exports = mongoose.model("Log", LogSchema);
