process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const Const = require("../const");

let mongo;

beforeAll(async () => {
  Const.logDebug("users.get.test - Creation de MongoMemoryServer");
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "tests" });
});

afterAll(async () => {
  await mongoose.disconnect();
  Const.logDebug("users.get.test - stop MongoMemoryServer");
  await mongo.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("GET /auth/users", () => {
  it("retourne la liste des users", async () => {
    const u1 = await User.create({
      email: "a@test.fr",
      password: "pass",
      firstname: "A",
      lastname: "A",
      roles: "ROLE_USER",
      createdAt: new Date("2026-01-01"),
    });
    const u2 = await User.create({
      email: "b@test.fr",
      password: "pass",
      firstname: "B",
      lastname: "B",
      roles: "ROLE_USER",
      createdAt: new Date("2026-01-02"),
    });

    const res = await request(app).get("/auth/users");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    const ids = res.body.users.map((u) => u._id);
    expect(ids).toContain(u1._id.toString());
    expect(ids).toContain(u2._id.toString());
  });
});

describe("POST /auth/usersbyids", () => {
  it("retourne uniquement les users demandes", async () => {
    const u1 = await User.create({
      email: "c@test.fr",
      password: "pass",
      firstname: "C",
      lastname: "C",
      roles: "ROLE_USER",
      createdAt: new Date("2026-01-03"),
    });
    const u2 = await User.create({
      email: "d@test.fr",
      password: "pass",
      firstname: "D",
      lastname: "D",
      roles: "ROLE_USER",
      createdAt: new Date("2026-01-04"),
    });
    const u3 = await User.create({
      email: "e@test.fr",
      password: "pass",
      firstname: "E",
      lastname: "E",
      roles: "ROLE_USER",
      createdAt: new Date("2026-01-05"),
    });

    const res = await request(app)
      .post(`/auth/usersbyids`)
      .send({
        userids: [
          u1._id.toString(),
          u3._id.toString(),
          "694ea206be5a8c3a34145cfe",
        ],
      });

    expect(res.status).toBe(200);
    const ids = res.body.users.map((u) => u._id);
    expect(ids).toContain(u1._id.toString());
    expect(ids).toContain(u3._id.toString());
    expect(ids).not.toContain(u2._id.toString());
  });

  it("retourne 404 si body est incorrect", async () => {
    const res = await request(app)
      .get("/auth/usersbyids")
      .send({
        userids: [
          "694ea1aabe5a8c3a34145cfb",
          "594ea206be5a8c3a34145cff",
          "694ea206be5a8c3a34145cfe",
          "idinvalide",
        ],
      });
    expect(res.status).toBe(404);
  });
});

describe("GET /auth/user/:id", () => {
  it("retourne le user correspondant", async () => {
    const u1 = await User.create({
      email: "one@test.fr",
      password: "pass",
      firstname: "One",
      lastname: "Test",
      roles: "ROLE_USER",
      createdAt: new Date("2026-01-06"),
    });

    const res = await request(app).get(`/auth/user/${u1._id.toString()}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(u1._id.toString());
    expect(res.body.email).toBe("one@test.fr");
  });

  it("retourne 400 si id invalide", async () => {
    const res = await request(app).get("/auth/user/id-invalide");

    expect(res.status).toBe(400);
  });
});
