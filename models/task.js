// MODEL TASK
const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  title: { type: String, require: true },
  description: { type: String },
  dueAt: { type: Date },
  priority: { type: String, require: true },
  state: { type: String, require: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
});

module.exports = mongoose.model("Task", taskSchema);
