const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Const = require("../const");
require("dotenv").config();

module.exports = (req, res, next) => {
    Const.logDebug("DEBUG - auth middleware");

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodeToken = jwt.verify(token, process.env.jwtSecret);
    const userId = decodeToken.userId;

    User.findOne({ _id: userId })
      .then((user) => {
        req.auth = {
          userId: userId,
          lastname: user.lastname,
          firstname: user.firstname,
          email: user.email,
          roles: user.roles,
        };

        next();
      })
      .catch((error) =>
        res.status(401).json({ message: "User definition problem!" })
      );
  } catch (error) {
    res.status(401).json({ error });
  }
};
