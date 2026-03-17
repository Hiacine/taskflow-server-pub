// CONTROLLER
const Project = require("../models/project");
const Const = require("../const");

exports.getAll = (req, res, next) => {
  Project.find()
    .then((projects) => res.status(200).json({ projects }))
    .catch((error) => res.status(400).json({ error }));
};

// members
exports.getByUserId = (req, res, next) => {
  Project.find({
    $or: [{ owner: req.params.id }, { members: req.params.id }],
  })
    .then((projects) => res.status(200).json({ projects }))
    .catch((error) => res.status(400).json({ error }));
};


exports.getOne = (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((proj) => res.status(200).json(proj))
    .catch((error) => res.status(400).json({ error }));
};

exports.addProject = (req, res, next) => {
  delete req.body._id;

  const myProject = new Project({ ...req.body });

  myProject
    .save()
    .then(() => res.status(200).json({ message: "project saved!" }))
    .catch((error) => {
      Const.logDebug(error);
      res.status(401).json({ error });
    });
};

exports.modifyOne = (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((proj) => {
      Const.logDebug("DEBUG - Modif projet ---------------------");
      Const.logDebug("DEBUG - Decoded userId : %s", req.auth.userId);
      Const.logDebug("DEBUG - Project owner : %s", proj.owner);

      // Pour éviter qu'un autre utilisateur modifie votre projet
      if (req.auth.userId !== proj.owner) {
        return res.status(403).json({
          message: "This project can be modified only by the original user!",
        });
      }

      proj
        .updateOne({ _id: req.params.id, ...req.body })
        .then(() => res.status(200).json({ message: "project updated!" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteOne = (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((proj) => {
      Const.logDebug("DEBUG - Supression projet ---------------------");
      Const.logDebug("DEBUG - Decoded userId : %s", req.auth.userId);
      Const.logDebug("DEBUG - Project owner : %s", proj.owner);

      // Pour éviter qu'un autre utilisateur supprime votre projet
      if (req.auth.userId !== proj.owner) {
        return res.status(403).json({
          message: "This project can be deleted only by the original user!",
        });
      }

      Project.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Project deleted!" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) =>
      res.status(401).json({ message: "This project can't be deleted!" })
    );
};

exports.addMember = (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((proj) => {
      Const.logDebug("addMember - auth userId : " + req.auth.userId);
      Const.logDebug("addMember - Project owner : " + proj.owner);
      Const.logDebug("addMember - body.userId : " + req.body.userId);

      // Pour éviter qu'un autre utilisateur modifie votre projet
      if (
        !req.auth.roles.includes(Const.USER_ROLE.MANAGER) &&
        req.auth.userId !== proj.owner
      ) {
        return res.status(403).json({
          message: "This project can be modified only by the original user!",
        });
      }

      if (proj.members.includes(req.body.userId)) {
        //Ce user est déjà dans les membres
        return res
          .status(200)
          .json({ message: "user already in project members!" });
      } else {
        // On ajoute le user dans les membres
        proj.members.push(req.body.userId);

        proj
          .updateOne({
            _id: req.params.id,
            members: proj.members,
          })
          .then(() =>
            res.status(200).json({ message: "project members updated!" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(401).json({ error }));
};

exports.deleteMember = (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((proj) => {
      Const.logDebug("DEBUG - DELETE projet MEMBER---------------------");
      Const.logDebug("DEBUG - Decoded userId : %s", req.auth.userId);
      Const.logDebug("DEBUG - Project owner : %s", proj.owner);

      // Pour éviter qu'un autre utilisateur modifie votre projet
      if (
        !req.auth.roles.includes(Const.USER_ROLE.MANAGER) &&
        req.auth.userId !== proj.owner
      ) {
        return res.status(403).json({
          message: "This project can be modified only by the original user!",
        });
      }

      if (!proj.members.includes(req.params.userId)) {
        //Ce user n'est pas dans les membres
        return res
          .status(200)
          .json({ message: "user is not present in then project members!" });
      } else {
        // On retrouve l'index du user dans les membres
        const userIndex = proj.members.indexOf(req.params.userId);

        proj.members.splice(userIndex, 1);

        proj
          .updateOne({
            _id: req.params.id,
            members: proj.members,
          })
          .then(() =>
            res.status(200).json({ message: "project user member deleted!" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(401).json({ error }));
};
