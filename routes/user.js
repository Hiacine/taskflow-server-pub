// ROUTE
const express = require("express");
const userController = require("../controllers/user");
const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: Gestion des utilistateurs
 */

/**
 * @swagger
 * /auth/signin:
 *  post:
 *   summary: Creation d'un user
 *   tags: [Users]
 *   requestBody:
 *       required: true
 *       content:
 *           application/json:
 *               schema:
 *                   type: object
 *                   required:
 *                       - email
 *                       - password
 *                       - firstname
 *                       - lastname
 *                       - role
 *                       - createdAt
 *                   properties:
 *                       email:
 *                           type: string
 *                           format: email
 *                       password:
 *                           type: string
 *                           format: password
 *                       firstname:
 *                           type: string
 *                       lastname:
 *                           type: string
 *                       roles:
 *                           type: string
 *                       createdAt:
 *                           type: string
 *                           format: date
 *   responses:
 *       200:
 *         description: Creation reussie
 *         content:
 *               application/json:
 *                   schema:
 *                       type: object
 *                       properties:
 *                           message:
 *                               type: string
 *       400:
 *         description: Creation echouee
 */
router.post("/signin", userController.signIn);

/**
 * @swagger
 * /auth/login:
 *  post:
 *   summary: Connexion d'un user
 *   tags: [Users]
 *   requestBody:
 *       required: true
 *       content:
 *           application/json:
 *               schema:
 *                   type: object
 *                   required:
 *                       - email
 *                       - password
 *                   properties:
 *                       email:
 *                           type: string
 *                           format: email
 *                       password:
 *                           type: string
 *                           format: password
 *   responses:
 *       200:
 *         description: Authentification reussie
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         token:
 *                             type: string
 *       500:
 *         description: Authentification echouee
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /auth/delete:
 *  delete:
 *   summary: Suppression d'un user
 *   tags: [Users]
 *   requestBody:
 *       required: true
 *       content:
 *           application/json:
 *               schema:
 *                   type: object
 *                   required:
 *                       - email
 *                   properties:
 *                       email:
 *                           type: string
 *                           format: email
 *   responses:
 *       200:
 *         description: Suppression reussie
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         message:
 *                             type: string
 *       400:
 *         description: Suppression echouee
 */
router.delete("/delete", userController.delete);

/**
 * @swagger
 * /auth/users:
 *  get:
 *   summary: Liste de tous les users
 *   tags: [Users]
 *   responses:
 *       200:
 *         description: Liste des users
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         users:
 *                             type: array
 *                             items:
 *                                 type: object
 *                                 properties:
 *                                     _id:
 *                                         type: string
 *                                     email:
 *                                         type: string
 *                                     firstname:
 *                                         type: string
 *                                     lastname:
 *                                         type: string
 *                                     roles:
 *                                         type: string
 *                                     createdAt:
 *                                         type: string
 *                                         format: date-time
 *       400:
 *         description: Erreur lors de la recuperation
 */
router.get("/users", userController.getAll);

/**
 * @swagger
 * /auth/usersbyids:
 *  post:
 *   summary: Liste des users par ids
 *   tags: [Users]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           required: [userids]
 *           properties:
 *             userids:
 *               type: array
 *               items:
 *                 type: string
 *   responses:
 *       200:
 *         description: Liste des users correspondants
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         users:
 *                             type: array
 *                             items:
 *                                 type: object
 *                                 properties:
 *                                     _id:
 *                                         type: string
 *                                     email:
 *                                         type: string
 *                                     firstname:
 *                                         type: string
 *                                     lastname:
 *                                         type: string
 *                                     roles:
 *                                         type: string
 *                                     createdAt:
 *                                         type: string
 *                                         format: date-time
 *       400:
 *         description: ids manquant ou erreur
 */
router.post("/usersbyids", userController.getUsersByIds);

/**
 * @swagger
 * /auth/user/{id}:
 *  get:
 *   summary: Recuperer un user par id
 *   tags: [Users]
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: Id du user
 *       schema:
 *         type: string
 *   responses:
 *       200:
 *         description: User trouve
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         _id:
 *                             type: string
 *                         email:
 *                             type: string
 *                         firstname:
 *                             type: string
 *                         lastname:
 *                             type: string
 *                         roles:
 *                             type: string
 *                         createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Erreur lors de la recuperation
 */
router.get("/user/:id", userController.getUserById);

/**
 * @swagger
 * /auth/user/{id}:
 *  patch:
 *   summary: Mettre a jour un user par id
 *   tags: [Users]
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: Id du user
 *       schema:
 *         type: string
 *   requestBody:
 *       required: true
 *       content:
 *           application/json:
 *               schema:
 *                   type: object
 *                   description: Mise a jour partielle d'un user. Tous les champs sont optionnels.
 *                   properties:
 *                       email:
 *                           type: string
 *                           format: email
 *                       password:
 *                           type: string
 *                           format: password
 *                       firstname:
 *                           type: string
 *                       lastname:
 *                           type: string
 *                       roles:
 *                           type: string
 *                       createdAt:
 *                           type: string
 *                           format: date
 *   responses:
 *       200:
 *         description: Mise a jour reussie
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         message:
 *                             type: string
 *                             example: user updated!
 *       400:
 *         description: Erreur lors de la mise a jour
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         error:
 *                             type: object
 */
router.patch("/user/:id", userController.updateOne);

module.exports = router;
