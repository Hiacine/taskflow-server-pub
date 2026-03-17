// MODEL Project
const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  title: { type: String, unique: true, require: true },
  description: { type: String, require: true },
  startAt: { type: Date, require: false },
  endAt: { type: Date, require: false },
  status: { type: String, require: true },
  owner: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("Project", projectSchema);
