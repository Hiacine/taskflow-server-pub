process.env.NODE_ENV = "test";
const request = require("supertest");

// mocks AVANT le require d'app
jest.mock("../middlwares/auth", () => (req, res, next) => {
  req.auth = { userId: "user-1" };
  next();
});

jest.mock("../models/project", () => ({
  findOne: jest.fn(),
}));
jest.mock("../models/tag", () => {
  const ctor = jest.fn();
  ctor.find = jest.fn();
  ctor.findOne = jest.fn();
  ctor.updateOne = jest.fn();
  ctor.deleteOne = jest.fn();
  return ctor;
});

// maintenant on importe app et les mocks
const app = require("../app");
const Project = require("../models/project");
const Tag = require("../models/tag");

describe("createProjectTag", () => {
  beforeEach(() => jest.clearAllMocks());

  it("200 quand membre", async () => {
    Project.findOne.mockResolvedValue({
      _id: "proj-1",
      members: ["user-1"],
      owner: "owner-1",
    });
    Tag.mockImplementation((doc) => ({
      ...doc,
      save: jest.fn().mockResolvedValue({ _id: "tag-1" }),
    }));

    const res = await request(app)
      .post("/projects/proj-1/tags")
      .send({ name: "Tag OK" });

    expect(res.statusCode).toBe(200);
    expect(Tag).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Tag OK", project: "proj-1" })
    );
  });

  // autres cas idem en configurant Project.findOne / Tag.mockImplementation
});

describe("getProjectTags", () => {
  beforeEach(() => jest.clearAllMocks());

  it("200 et retourne les tags", async () => {
    Tag.find.mockResolvedValue([{ _id: "tag-1" }, { _id: "tag-2" }]);

    const res = await request(app).get("/projects/proj-1/tags");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.tags)).toBe(true);
    expect(Tag.find).toHaveBeenCalledWith({ project: "proj-1" });
  });
});

describe("modifyTag", () => {
  beforeEach(() => jest.clearAllMocks());

  it("200 si owner ou membre", async () => {
    Tag.findOne.mockResolvedValue({ _id: "tag-1", project: "proj-1" });
    Project.findOne.mockResolvedValue({
      _id: "proj-1",
      owner: "owner-1",
      members: ["user-1"],
    });
    Tag.updateOne.mockResolvedValue({});

    const res = await request(app)
      .patch("/tags/tag-1")
      .send({ name: "Updated" });

    expect(res.statusCode).toBe(200);
    expect(Tag.updateOne).toHaveBeenCalled();
  });

  it("401 si ni owner ni membre", async () => {
    Tag.findOne.mockResolvedValue({ _id: "tag-1", project: "proj-1" });
    Project.findOne.mockResolvedValue({
      _id: "proj-1",
      owner: "owner-1",
      members: [],
    });

    const res = await request(app)
      .patch("/tags/tag-1")
      .send({ name: "Updated" });

    expect(res.statusCode).toBe(401);
    expect(Tag.updateOne).not.toHaveBeenCalled();
  });
});

describe("deleteTag", () => {
  beforeEach(() => jest.clearAllMocks());

  it("200 si owner ou membre", async () => {
    Tag.findOne.mockResolvedValue({ _id: "tag-1", project: "proj-1" });
    Project.findOne.mockResolvedValue({
      _id: "proj-1",
      owner: "owner-1",
      members: ["user-1"],
    });
    Tag.deleteOne.mockResolvedValue({});

    const res = await request(app).delete("/tags/tag-1");

    expect(res.statusCode).toBe(200);
    expect(Tag.deleteOne).toHaveBeenCalled();
  });

  it("401 si ni owner ni membre", async () => {
    Tag.findOne.mockResolvedValue({ _id: "tag-1", project: "proj-1" });
    Project.findOne.mockResolvedValue({
      _id: "proj-1",
      owner: "owner-1",
      members: [],
    });

    const res = await request(app).delete("/tags/tag-1");

    expect(res.statusCode).toBe(401);
    expect(Tag.deleteOne).not.toHaveBeenCalled();
  });

  it("400 en cas d'erreur sur la recherche du tag", async () => {
    Tag.findOne.mockRejectedValue(new Error("tag find error"));

    const res = await request(app).delete("/tags/tag-1");

    expect(res.statusCode).toBe(400);
    expect(Tag.deleteOne).not.toHaveBeenCalled();
  });

  it("402 en cas d'erreur sur la recherche du projet", async () => {
    Tag.findOne.mockResolvedValue({ _id: "tag-1", project: "proj-1" });
    Project.findOne.mockRejectedValue(new Error("project find error"));

    const res = await request(app).delete("/tags/tag-1");

    expect(res.statusCode).toBe(402);
    expect(Tag.deleteOne).not.toHaveBeenCalled();
  });
});

describe("findTagsByIds", () => {
  beforeEach(() => jest.clearAllMocks());

  it("200 et retourne les tags demandes", async () => {
    Tag.find.mockResolvedValue([{ _id: "t1" }, { _id: "t2" }]);

    const res = await request(app)
      .post("/tags/findbyids")
      .send({ tagsids: ["t1", "t2"] });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.tags)).toBe(true);
    expect(Tag.find).toHaveBeenCalledWith({ _id: { $in: ["t1", "t2"] } });
  });
});

describe("findTagByNameInProject", () => {
  beforeEach(() => jest.clearAllMocks());

  it("200 et retourne le tag quand il existe", async () => {
    Tag.findOne.mockResolvedValue({
      _id: "tag-1",
      name: "Backend",
      project: "proj-1",
    });

    const res = await request(app).post("/tags/findtagbyname").send({
      tagName: "Backend",
      projectId: "proj-1",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      _id: "tag-1",
      name: "Backend",
      project: "proj-1",
    });
    expect(Tag.findOne).toHaveBeenCalledWith({
      name: "Backend",
      project: "proj-1",
    });
  });

  it("200 et retourne NOT_FOUND quand le tag n'existe pas", async () => {
    Tag.findOne.mockResolvedValue(null);

    const res = await request(app).post("/tags/findtagbyname").send({
      tagName: "Inexistant",
      projectId: "proj-1",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      _id: "NOT_FOUND",
      name: "Inexistant",
      project: "proj-1",
    });
  });

  it("400 en cas d'erreur model", async () => {
    Tag.findOne.mockRejectedValue(new Error("db error"));

    const res = await request(app).post("/tags/findtagbyname").send({
      tagName: "Backend",
      projectId: "proj-1",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
