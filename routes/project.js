// ROUTE PROJECTS
const express = require("express");
const router = express.Router();
const auth = require("../middlwares/auth");
const projectController = require("../controllers/project");
const taskController = require("../controllers/task");
const tagController = require("../controllers/tag");

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Gestion des projets
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Liste les projets
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Liste des projets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       startAt:
 *                         type: string
 *                         format: date-time
 *                       endAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                       owner:
 *                         type: string
 *                       members:
 *                         type: array
 *                         items:
 *                           type: string
 *   post:
 *     summary: Cree un projet
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, status, owner]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               endAt:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               owner:
 *                 type: string
 *     responses:
 *       200:
 *         description: Projet cree
 */
router.get("/", projectController.getAll);

/**
 * @swagger
 * /projects/byuser/{id}:
 *   get:
 *     summary: Liste les projets dont l'utilisateur est owner ou membre
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des projets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       startAt:
 *                         type: string
 *                         format: date-time
 *                       endAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                       owner:
 *                         type: string
 *                       members:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get("/byuser/:id", projectController.getByUserId);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Recupere un projet
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projet retourne
 */
router.get("/:id", projectController.getOne);
router.post("/", projectController.addProject);

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Met a jour un projet
 *     tags: [Projects]
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
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               endAt:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Projet mis a jour
 *   delete:
 *     summary: Supprime un projet
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projet supprime
 */
router.patch("/:id", auth, projectController.modifyOne);
router.delete("/:id", auth, projectController.deleteOne);

/**
 * @swagger
 * /projects/{id}/members:
 *   post:
 *     summary: Ajoute un membre au projet
 *     tags: [Projects]
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
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Membre ajoute
 */
router.post("/:id/members", auth, projectController.addMember);

/**
 * @swagger
 * /projects/{id}/members/{userId}:
 *   delete:
 *     summary: Supprime un membre du projet
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Membre supprime
 */
router.delete("/:id/members/:userId", auth, projectController.deleteMember);

/**
 * @swagger
 * /projects/{id}/tasks:
 *   get:
 *     summary: Liste les taches du projet
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: dueAt
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Liste des taches
 *   post:
 *     summary: Ajoute une tache au projet
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
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
 *             required: [title, priority, state]
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
 *         description: Tache creee
 *       403:
 *         description: Seul le owner du projet peut ajouter une tache
 *       401:
 *         description: Projet introuvable ou erreur de lecture projet
 *       400:
 *         description: Erreur lors de la creation de la tache
 */
router.get("/:id/tasks", auth, taskController.getProjectTasks);

router.post("/:id/tasks", auth, taskController.addTask);

/**
 * @swagger
 * /projects/{id}/tags:
 *   get:
 *     summary: Liste les tags du projet
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des tags
 *   post:
 *     summary: Ajoute un tag au projet
 *     tags: [Projects]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag cree
 */
router.get("/:id/tags", tagController.getProjectTags);

router.post("/:id/tags", auth, tagController.createProjectTag);

module.exports = router;
