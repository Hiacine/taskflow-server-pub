// MODEL
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstname: { type: String },
  lastname: { type: String },
  roles: { type: String, required: true },
  //roles: [{ type: String }],
  createdAt: { type: Date, required: true },
});

module.exports = mongoose.model("User", userSchema);
