process.env.NODE_ENV = "test";

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const Const = require("../const");

let mongo;

beforeAll(async () => {
  Const.logDebug("user.patch.test - Creation de MongoMemoryServer");
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "tests" });
});

afterAll(async () => {
  await mongoose.disconnect();
  Const.logDebug("user.patch.test - stop MongoMemoryServer");
  await mongo.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("PATCH /auth/user/:id", () => {
  it("met a jour un user", async () => {
    const created = await User.create({
      email: "patch@test.fr",
      password: "pass",
      firstname: "Old",
      lastname: "Name",
      roles: "ROLE_USER",
      createdAt: new Date("2026-01-10"),
    });

    const res = await request(app)
      .patch(`/auth/user/${created._id.toString()}`)
      .send({ firstname: "New", lastname: "Name2" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("user updated!");

    const updated = await User.findById(created._id);
    expect(updated.firstname).toBe("New");
    expect(updated.lastname).toBe("Name2");
  });

  it("hash le mot de passe lors de la mise a jour", async () => {
    const created = await User.create({
      email: "password@test.fr",
      password: "ancien-mot-de-passe",
      firstname: "Patch",
      lastname: "Password",
      roles: "ROLE_USER",
      createdAt: new Date("2026-01-11"),
    });

    const res = await request(app)
      .patch(`/auth/user/${created._id.toString()}`)
      .send({ password: "nouveau-mot-de-passe" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("user updated!");

    const updated = await User.findById(created._id);
    expect(updated.password).not.toBe("nouveau-mot-de-passe");
    await expect(
      bcrypt.compare("nouveau-mot-de-passe", updated.password),
    ).resolves.toBe(true);
  });

  it("retourne 400 si id invalide", async () => {
    const res = await request(app)
      .patch("/auth/user/id-invalide")
      .send({ firstname: "New" });

    expect(res.status).toBe(400);
  });
});
