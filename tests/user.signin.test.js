process.env.NODE_ENV = "test"; // évite la connexion Mongo dans app.js pendant les tests


const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const Const = require("../const");

let mongo;

beforeAll(async () => {
  Const.logDebug('User.signin.test - Création de MongoMemoryServer');
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "tests" });
});

afterAll(async () => {
  await mongoose.disconnect();
  Const.logDebug('User.signin.test - stop MongoMemoryServer');
  await mongo.stop();
});




describe("Test de la création d'un user : POST signIn", () => {
  Const.logDebug("usersigningTest - Création d'un user");
  it("creation du user", async () => {
    const res = await request(app).post("/auth/signin").send({
      email: "user@test.fr",
      password: "123",
      firstname: "user",
      lastname: "user",
      roles: "ROLE_USER",
      createdAt: "2026/01/01"
    });

    const createdUser = await user.findOne({ email: "user@test.fr" });

    expect(res.status).toBe(200);
    expect(res.body.message).toEqual("User created!");
    expect(createdUser.roles).toEqual("ROLE_USER");
    const passwordMatches = await bcrypt.compare("123", createdUser.password);
    expect(passwordMatches).toBe(true);
  });
});

describe("login d'un utilisateur : POST login", () => {
  it("login d'un utilisateur", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "user@test.fr",
      password: "123",
    });

    expect(res.status).toBe(200);
    expect(res.body.email).toEqual('user@test.fr');
    expect(res.body.firstname).toEqual('user');
    expect(res.body.lastname).toEqual('user');
    expect(res.body.roles).toEqual('ROLE_USER');
    expect(res.body.token).toBeDefined();
    
  });
});



describe("login d'un utilisateur avec mauvais mot de passe : POST login", () => {
  it("login d'un utilisateur", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "user@test.fr",
      password: "123456",
    });

    expect(res.status).toBe(500);
  });
});

describe("delete d'un utilisateur : DELETE delete", () => {
  it("delete d'un utilisateur", async () => {
    const res = await request(app).delete("/auth/delete").send({
      email: "user@test.fr",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toEqual("User deleted!");
  });
});
