// backend/models/Message.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { 
    type: String, 
    required: true,
    // "team" means broadcast to whole team (manager -> team); otherwise it's a user id string
  },
  content: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // array of user ids who read
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
