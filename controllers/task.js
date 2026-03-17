// CONTROLLER TASK
const mongoose = require("mongoose");
const Project = require("../models/project");
const Task = require("../models/task");
const Const = require("../const");

/*



*/

/**
 * Récupère toutes les tâche d'un projet.
 *
 * les différents filtres :
 * ?state=in_progress&priority=low&dueAt=2025-12-31
 *
 * sort by dueAt
 *
 * pagination avec page et limit
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getProjectTasks = (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((proj) => {
      // On vérifie que le user a bien les droits de lister les taâches du projet
      Const.logDebug("DEBUG - auth user : " + req.auth.userId);
      Const.logDebug("DEBUG - proj owner : " + proj.owner);

      if (req.auth.userId !== proj.owner) {
        return res
          .status(401)
          .json({ message: "Only owner can show project's tasks!" });
      }

      var query = { project: new mongoose.Types.ObjectId(req.params.id) };

      // On récupère les
      const { state, priority, dueAt, assignee, page, limit } = {
        ...req.query,
      };

      // Si on a un. parametre state
      if (state) {
        query.state = state;
      }

      // si on a un parametre priority
      if (priority) {
        query.priority = priority;
      }

      // Si on a le dueAt
      if (dueAt) {
        query.dueAt = dueAt;
      }

      // Si on a le user
      if (assignee) {
        query.assignee = new mongoose.Types.ObjectId(assignee);
      }

      const parsePage = Number(page);
      const parseLimit = Number(limit);
      const pageNum =
        Number.isInteger(parsePage) && parsePage > 0 ? parsePage : 1;
      const limitNum =
        Number.isInteger(parseLimit) && parseLimit > 0 ? parseLimit : 50;

      const sortDirection = req.query.sort == "desc" ? -1 : 1;

      Const.logDebug("getProjectTasks : query : " + JSON.stringify(query));

      Task.aggregate([
        { $match: query },
        { $sort: { dueAt: sortDirection } },
        {
          $facet: {
            metaData: [
              { $count: "totalDocuments" },
              {
                $addFields: {
                  pageNumber: pageNum,
                  totalPage: {
                    $ceil: { $divide: ["$totalDocuments", limitNum] },
                  },
                  limit: limitNum,
                },
              },
            ],
            data: [{ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum }],
          },
        },
      ])
        .then((tasks) => {
          res.status(200).json(tasks);
        })
        .catch((error) => {
          Const.logDebug(error);
          res.status(400).json({ error });
        });
    })
    .catch((error) => {
      Const.logDebug("getProjectTasks : " + error);
      return res.status(401).json({ error });
    });
};

/**
 * Ajout d'une tâche à un projet.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.addTask = (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((proj) => {
      if (req.auth.userId !== proj.owner) {
        return res
          .status(403)
          .json({ message: "Only the project's owner can add task!" });
      }

      const task = new Task({ ...req.body, project: req.params.id });

      task
        .save()
        .then(() => res.status(200).json({ message: "Task created!" }))
        .catch((error) =>
          res.status(400).json({ message: "A problem occurs creating task!" }),
        );
    })
    .catch((error) => res.status(401).json({ error }));
};

/**
 * Récupère une tâche.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.findOneTask = (req, res, next) => {
  Task.find({ _id: req.params.id })
    .then((task) => res.status(200).json(task))
    .catch((error) => res.status(500).json({ error }));
};

exports.getTasksByIds = (req, res, next) => {
  Task.find({ _id: { $in: req.body.tasksIds } })
    .then((tasks) => res.status(200).json({ tasks }))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Modifie une tâche.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.modifyTask = (req, res, next) => {
  Task.findOne({ _id: req.params.id })
    .then((task) => {
      Project.findOne({ _id: task.project })
        .then((proj) => {
          Const.logDebug("modifyTask--------------");
          Const.logDebug("auth user : " + req.auth.userId);
          Const.logDebug("proj owner : " + proj.owner);
          Const.logDebug("task assignee : " + task.assignee);

          if (
            (req.auth.userId !== proj.owner) &
            (req.auth.userId !== task.assignee)
          ) {
            return res.status(403).json({
              message:
                "Task can be modified only by the project's owner or task's assignee!",
            });
          }

          // On peut modifier la tâche
          Task.updateOne({ _id: req.params.id }, { ...req.body })
            .then(() => res.status(200).json({ message: "Task modified!" }))
            .catch((error) => {
              Const.logDebug(error);
              res.status(400).json({ error });
            });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(401).json({ error }));
};

/**
 * Supprime une tâche.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.deleteTask = (req, res, next) => {
  Task.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Task deleted!" }))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Ferme une tâche.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.closeTask = (req, res, next) => {
  Task.findOne({ _id: req.params.id })
    .then((task) => {
      Const.logDebug("auth user     : " + req.auth.userId);
      Const.logDebug("task assignee : " + task.assignee);

      if (req.auth.userId != task.assignee) {
        return res
          .status(401)
          .json({ message: "Task can be close only by assignee!" });
      }

      Task.updateOne(
        { _id: req.params.id },
        { $set: { state: Const.TASK_STATE.CLOSED } },
      )
        .then(() => res.status(200).json({ message: "Task closed!" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Ouvre une tâche.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.openTask = (req, res, next) => {
  Task.findOne({ _id: req.params.id })
    .then((task) => {
      Const.logDebug("auth user     : " + req.auth.userId);
      Const.logDebug("task assignee : " + task.assignee);

      if (req.auth.userId != task.assignee) {
        return res
          .status(401)
          .json({ message: "Task can be opened only by assignee!" });
      }

      Task.updateOne(
        { _id: req.params.id },
        { $set: { state: Const.TASK_STATE.OPEN } },
      )
        .then(() => res.status(200).json({ message: "Task opend!" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

/**
 * On ajoute un assigné à une tâche.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.addAssignee = (req, res, next) => {
  //Je cherche la tâche
  Task.findOne({ _id: req.params.id })
    .then((task) => {
      //je récupère le projet aossocié
      Project.findOne({ _id: task.project })
        .then((proj) => {
          //je vérifie si la personne connecté est le owner
          if (proj.owner === req.auth.userId) {
            //si oui j'update l'assigné
            Task.updateOne(
              { _id: req.params.id },
              { assignee: req.body.assignee },
            )
              .then(() => {
                Const.logDebug("update de assignee");
                res.status(200).json({ message: "Task assignee updated!" });
              })
              .catch((error) => {
                Const.logDebug("error d'update \n%s", error);
                res.status(401).json({ error });
              });
          } else {
            Const.logDebug("Only the project owner can assign tasks");
            return res
              .status(402)
              .json({ message: "Only the project owner can assign tasks" });
          }
        })
        .catch((error) => {
          Const.logDebug(error);
          return res.status(401).json({ error });
        });
    })
    .catch((error) => res.status(400).json({ error }));
};

/**
 * On supprime un assigné d'une tâche.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.deleteAssignee = (req, res, next) => {
  //Je cherche la tâche
  Task.findOne({ _id: req.params.id })
    .then((task) => {
      //je récupère le projet aossocié
      Project.findOne({ _id: task.project })
        .then((proj) => {
          //je vérifie si la personne connecté est le owner
          if (proj.owner === req.auth.userId) {
            //si oui j'update l'assigné
            Task.updateOne({ _id: req.params.id }, { $unset: { assignee: "" } })
              .then(() => {
                Const.logDebug("supression de l'assignee");
                res.status(200).json({ message: "Task assignee deleted!" });
              })
              .catch((error) => {
                Const.logDebug("error d'update \n%s", error);
                res.status(401).json({ error });
              });
          } else {
            Const.logDebug("Only the project owner delete assign tasks");
            return res.status(402).json({
              message: "Only the project owner can delete assign tasks",
            });
          }
        })
        .catch((error) => {
          Const.logDebug(error);
          return res.status(401).json({ error });
        });
    })
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Ajout d'un tag dans une tâche.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.addTagToTask = (req, res, next) => {
  Task.findOne({ _id: req.params.id })
    .then((task) => {
      Project.findOne({ _id: task.project })
        .then((proj) => {
          if (
            (req.auth.userId != proj.owner) &
            (proj.members.includes(req.auth.userId) == false)
          ) {
            return res.status(401).json({
              message: "Only project owner or members can add tags!",
            });
          } else {
            task.tags.push(req.params.tagId);

            Const.logDebug("addTagToTask - task.id = " + req.params.id);
            Const.logDebug("addTagToTask - Task.tags : " + task.tags);

            task
              .updateOne({ _id: req.params.id, tags: task.tags })
              .then(() =>
                res.status(200).json({ message: "tag added to task!" }),
              )
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(401).json({ error }));

      if (task.tags.includes(req.params.tagId)) {
        return res
          .status(400)
          .json({ message: "Tag already exists in this taks!" });
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Suppression d'un tag dans une tâche.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.deleteTagFomTask = (req, res, next) => {
  Task.findOne({ _id: req.params.id })
    .then((task) => {
      Const.logDebug("addTagToTask - task.id = " + req.params.id);
      Const.logDebug("addTagToTask - Task.tags : " + task.tags);
      Const.logDebug("addTagToTask - tag to delete : " + req.params.tagId);
      Const.logDebug("addTagToTask - auth.userId : " + req.auth.userId);
      Const.logDebug("addTagToTask - task.assignee : " + task.assignee);

      Project.findOne({ _id: task.project }) // je charge le projet pour connaitre les ayants droits
        .then((proj) => {
          Const.logDebug("addTagToTask - proj owner : " + proj.owner);

          if (
            (req.auth.userId != proj.owner) &
            (proj.members.includes(req.auth.userId) == false)
          ) {
            return res.status(401).json({
              message: "Only project owner or members can delete tags!",
            });
          } else {
            const indexOfTag = task.tags.indexOf(req.params.tagId);

            if (indexOfTag != -1) {
              task.tags.splice(indexOfTag, 1);

              task
                .updateOne({ _id: req.params.id, tags: task.tags })
                .then(() => {
                  return res
                    .status(200)
                    .json({ message: "tag deleted from task!" });
                })
                .catch((error) => res.status(400).json({ error }));
            } else {
              return res
                .status(404)
                .json({ message: "can't delete tag from task!" });
            }
          }
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};
