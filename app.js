const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const Const = require("./const");
const userRoutes = require("./routes/user");
const projectRoutes = require("./routes/project");
const tagRoutes = require("./routes/tag");
const taskRoutes = require("./routes/task");
const constants = require("./constants/constants.js");

const app = express();
const setupSwagger = require("./swagger");

// Évite une double connexion en test : on ne connecte pas automatiquement quand NODE_ENV === "test"
if (process.env.NODE_ENV !== "test") {
  console.log(constants.intro);

  mongoose
    .connect(
      "mongodb+srv://" +
        process.env.mongoUser +
        ":" +
        process.env.mongoPassword +
        "@" +
        process.env.mongoUrl,
    )
    .then(() => {
      Const.logDebug("app - Connexion à MongoDB réussie !");
    })
    .catch(() => {
      Const.logDebug("app - Connexion à MongoDB échouée !");
    });
}

// Parse automatiquement le JSON pour pouvoir accéder à req.body
app.use(express.json());

// Nos Routes
app.use("/auth", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tags", tagRoutes);
app.use("/tasks", taskRoutes);

setupSwagger(app);

module.exports = app;
