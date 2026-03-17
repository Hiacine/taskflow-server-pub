process.env.NODE_ENV = "test"; // évite la connexion Mongo dans app.js pendant les tests



const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const user = require("../models/user");
const Project = require("../models/project");
const bcrypt = require("bcrypt");
const Const = require("../const");

let mongo;

beforeAll(async () => {
  Const.logDebug('project.test - Création de MongoMemoryServer');
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "tests" });
});

afterAll(async () => {
  await mongoose.disconnect();
  Const.logDebug('project.test - stop MongoMemoryServer');
  await mongo.stop();
});

beforeEach(async () => {
  await Project.deleteMany({});
});


describe("Creation d'un projet", () => {
  it("Creation d'un projet", async () => {
    const res = await request(app).post("/projects").send(
        {
        title: "Mon projet de MENEL",
        description: "Ceci est la description",
        startAt: "2026/01/01",
        endAt: "2026/01/01",
        status: "active",
        owner:"694e36f03334d541653f3bc1",
        members: []
        }
    );

    expect(res.status).toBe(200);
  });
});

describe("getByUserId", () => {
  it("retourne les projets ou l'utilisateur est owner ou membre", async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherUserId = new mongoose.Types.ObjectId();

    const ownerProject = await Project.create({
      title: "Projet owner",
      description: "owner match",
      status: "active",
      owner: userId.toString(),
      members: [],
    });

    const memberProject = await Project.create({
      title: "Projet member",
      description: "member match",
      status: "active",
      owner: otherUserId.toString(),
      members: [userId],
    });

    const otherProject = await Project.create({
      title: "Projet autre",
      description: "no match",
      status: "active",
      owner: otherUserId.toString(),
      members: [],
    });

    const res = await request(app).get(
      "/projects/byuser/" + userId.toString()
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.projects)).toBe(true);

    const ids = res.body.projects.map((p) => p._id);
    expect(ids).toContain(ownerProject._id.toString());
    expect(ids).toContain(memberProject._id.toString());
    expect(ids).not.toContain(otherProject._id.toString());
  });
});
