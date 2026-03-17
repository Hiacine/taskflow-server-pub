// ROUTE
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task");
const auth = require("../middlwares/auth");

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestion des taches
 */

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Recupere une tache
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tache retournee
 *   patch:
 *     summary: Met a jour une tache
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueAt:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *               state:
 *                 type: string
 *               assignee:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tache mise a jour
 *   delete:
 *     summary: Supprime une tache
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tache supprimee
 */
/**
 * @swagger
 * /tasks/tasksbyids:
 *   get:
 *     summary: Recupere des taches par ids
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tasksIds]
 *             properties:
 *               tasksIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Liste des taches
 */
router.get("/tasksbyids", taskController.getTasksByIds);

router.get("/:id", taskController.findOneTask);


router.patch("/:id", auth, taskController.modifyTask);
router.delete("/:id", taskController.deleteTask);

/**
 * @swagger
 * /tasks/{id}/close:
 *   post:
 *     summary: Ferme une tache
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tache fermee
 */
router.post("/:id/close", auth, taskController.closeTask);

/**
 * @swagger
 * /tasks/{id}/open:
 *   post:
 *     summary: Rouvre une tache
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tache rouverte
 */
router.post("/:id/open", auth, taskController.openTask);

/**
 * @swagger
 * /tasks/{id}/assignee:
 *   post:
 *     summary: Affecte un utilisateur a la tache
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignee]
 *             properties:
 *               assignee:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assigne mis a jour
 *   delete:
 *     summary: Retire l assigne de la tache
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assigne supprime
 */
router.post("/:id/assignee", auth, taskController.addAssignee);
router.delete("/:id/assignee", auth, taskController.deleteAssignee);

/**
 * @swagger
 * /tasks/{id}/tags/{tagId}:
 *   post:
 *     summary: Ajoute un tag a la tache
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag ajoute a la tache
 *   delete:
 *     summary: Supprime un tag de la tache
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag supprime de la tache
 */
router.post("/:id/tags/:tagId", auth, taskController.addTagToTask);
router.delete("/:id/tags/:tagId", auth, taskController.deleteTagFomTask);

module.exports = router;
