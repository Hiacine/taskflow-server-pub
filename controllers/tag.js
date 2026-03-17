// CONTROLLER TAGS
const Tag = require("../models/tag");
const Project = require("../models/project");
const Const = require("../const");

exports.getProjectTags = (req, res, next) => {
  Tag.find({ project: req.params.id })
    .then((tags) => res.status(200).json({ tags }))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Création d'un tag.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createProjectTag = (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((proj) => {
      Const.logDebug("createProjectTag : auth user : " + req.auth.userId);
      Const.logDebug("createProjectTag : project member : " + proj.members);

      if (
        !proj.members.includes(req.auth.userId) &&
        proj.owner != req.auth.userId
      ) {
        return res
          .status(401)
          .json({ message: "You must be a member or the owner to add tag!" });
      }

      Tag({ ...req.body, project: req.params.id })
        .save()
        .then((tag) => {
          res.status(200).json({ message: "Tag created!", tag });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Modification d'un tag.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.modifyTag = (req, res, next) => {
  Tag.findOne({ _id: req.params.id })
    .then((tag) => {
      Project.findOne({ _id: tag.project })
        .then((proj) => {
          Const.logDebug("deleteTag - auth user : " + req.auth.userId);
          Const.logDebug("deleteTag - proj.owner : " + proj.owner);
          Const.logDebug("deleteTag - proj.members : " + proj.members);

          if (
            (req.auth.userId != proj.owner) &
            !proj.members.includes(req.auth.userId)
          ) {
            return res.status(401).json({
              message: "Only project owner or members cans delete Tags!",
            });
          } else {
            Tag.updateOne({ _id: tag._id }, { ...req.body })
              .then(() => res.status(200).json({ message: "Tag modified!" }))
              .catch((error) => res.status(500).json({ error }));
          }
        })
        .catch((error) => {
          Const.logDebug("modifyTag - error : " + error);
          res.status(500).json({ error });
        });
    })
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Suppression d'un Tag.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.deleteTag = (req, res, next) => {
  Tag.findOne({ _id: req.params.id })
    .then((tag) => {
      Project.findOne({ _id: tag.project })
        .then((proj) => {
          Const.logDebug("deleteTag - auth user : " + req.auth.userId);
          Const.logDebug("deleteTag - proj.owner : " + proj.owner);
          Const.logDebug("deleteTag - proj.members : " + proj.members);

          if (
            (req.auth.userId != proj.owner) &
            !proj.members.includes(req.auth.userId)
          ) {
            return res.status(401).json({
              message: "Only project owner or members cans delete Tags!",
            });
          } else {
            Tag.deleteOne({ _id: req.params.id })
              .then(() => res.status(200).json({ message: "Tag deleted!" }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(402).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.findTagsByIds = (req, res, next) => {
  Tag.find({ _id: { $in: req.body.tagsids } })
    .then((tags) => res.status(200).json({ tags }))
    .catch((error) => res.status(400).json({ error }));
};

// Si on ne trouve pas de tag on retourne le tag avec pour ID : NOT_FOUND
exports.findTagByNameInProject = (req, res, next) => {
  Tag.findOne({ name: req.body.tagName, project: req.body.projectId })
    .then((tag) => {
      if (tag == null) {
        res.status(200).json({
          _id: "NOT_FOUND",
          name: req.body.tagName,
          project: req.body.projectId,
        });
      } else {
        res.status(200).json(tag);
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
