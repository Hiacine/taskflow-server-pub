// CONTROLLER
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signIn = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hashed) => {
      delete req.body.password;
      const myUser = new User({ ...req.body, password: hashed });

      myUser
        .save()
        .then(() => res.status(200).json({ message: "User created!" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAll = (req, res, next) => {
  User.find()
    .then((users) => res.status(200).json({ users }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getUsersByIds = (req, res, next) => {
  User.find({ _id: { $in: req.body.userids } })
    .then((users) => res.status(200).json({ users }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getUserById = (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(400).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((userFinded) => {
      bcrypt
        .compare(req.body.password, userFinded.password)
        .then((userVerified) => {
          if (userVerified) {
            const token = jwt.sign(
              { userId: userFinded.id },
              process.env.jwtSecret,
              { expiresIn: "30 days" },
            );

            res.status(200).json({
              userId: userFinded.id,
              email: userFinded.email,
              firstname: userFinded.firstname,
              lastname: userFinded.lastname,
              roles: userFinded.roles,
              token: token,
            });
          } else {
            res.status(400).json({ error });
          }
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(501).json({ error }));
};

exports.delete = (req, res, next) => {
  User.deleteOne({ email: req.body.email })
    .then(() => res.status(200).json({ message: "User deleted!" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.updateOne = (req, res, next) => {
  if ((req.body.password != null) & (req.body.password != "")) {
    bcrypt.hash(req.body.password, 10).then((hashed) => {
      delete req.body.password;

      User.updateOne({ _id: req.params.id }, { ...req.body, password: hashed })
        .then(() => res.status(200).json({ message: "user updated!" }))
        .catch((error) => res.status(400).json({ error }));
    });
  } else {
    console.log("pwd absent");

    User.updateOne({ _id: req.params.id }, { ...req.body })
      .then(() => res.status(200).json({ message: "user updated!" }))
      .catch((error) => res.status(400).json({ error }));
  }
};
