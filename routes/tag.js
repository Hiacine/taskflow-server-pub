// ROUTE
const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tag");
const auth = require("../middlwares/auth");

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Gestion des tags
 */

/**
 * @swagger
 * /tags/{id}:
 *   patch:
 *     summary: Met a jour un tag
 *     tags: [Tags]
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag modifie
 *   delete:
 *     summary: Supprime un tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag supprime
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Utilisateur non autorise (ni owner ni membre)
 *       400:
 *         description: Erreur de requete sur le tag
 *       402:
 *         description: Erreur lors de la verification du projet
 */
router.patch("/:id", auth, tagController.modifyTag);
router.delete("/:id", auth, tagController.deleteTag);

/**
 * @swagger
 * /tags/findbyids:
 *   post:
 *     summary: Recupere des tags par ids
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tagsids]
 *             properties:
 *               tagsids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Liste des tags
 */
router.post("/findbyids", tagController.findTagsByIds);

/**
 * @swagger
 * /tags/findtagbyname:
 *   post:
 *     summary: Recherche un tag par nom dans un projet
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tagName, projectId]
 *             properties:
 *               tagName:
 *                 type: string
 *               projectId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag trouve ou objet NOT_FOUND
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 project:
 *                   type: string
 *       400:
 *         description: Erreur de requete
 */
router.post("/findtagbyname", tagController.findTagByNameInProject);

module.exports = router;
