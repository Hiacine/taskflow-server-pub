// MODEL
const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
  name: { type: String, require: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
});

// Unicity: name scoped per project
tagSchema.index({ name: 1, project: 1 }, { unique: true });

module.exports = mongoose.model("Tag", tagSchema);
