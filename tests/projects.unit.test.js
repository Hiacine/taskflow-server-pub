process.env.NODE_ENV = "test";
const request = require("supertest");

const mockAuth = { userId: "user-1", roles: ["ROLE_USER"] };

jest.mock("../middlwares/auth", () => (req, res, next) => {
  req.auth = mockAuth;
  next();
});

jest.mock("../models/project", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
}));

const app = require("../app");
const Project = require("../models/project");

describe("Projects controller (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.userId = "user-1";
    mockAuth.roles = ["ROLE_USER"];
  });

  describe("getAll GET /projects", () => {
    it("200 et retourne les projets", async () => {
      Project.find.mockResolvedValue([{ _id: "p1" }, { _id: "p2" }]);

      const res = await request(app).get("/projects");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.projects)).toBe(true);
    });
  });

  describe("getOne GET /projects/:id", () => {
    it("200 et retourne le projet", async () => {
      Project.findOne.mockResolvedValue({ _id: "p1", title: "P1" });

      const res = await request(app).get("/projects/p1");

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe("p1");
    });
  });

  describe("modifyOne PATCH /projects/:id", () => {
    it("403 si pas owner", async () => {
      Project.findOne.mockResolvedValue({
        _id: "p1",
        owner: "owner-1",
        updateOne: jest.fn(),
      });

      const res = await request(app).patch("/projects/p1").send({ title: "X" });

      expect(res.statusCode).toBe(403);
    });

    it("200 si owner", async () => {
      const projDoc = {
        _id: "p1",
        owner: "user-1",
        updateOne: jest.fn().mockResolvedValue({}),
      };
      Project.findOne.mockResolvedValue(projDoc);

      const res = await request(app).patch("/projects/p1").send({ title: "X" });

      expect(res.statusCode).toBe(200);
      expect(projDoc.updateOne).toHaveBeenCalled();
    });
  });

  describe("deleteOne DELETE /projects/:id", () => {
    it("403 si pas owner", async () => {
      Project.findOne.mockResolvedValue({ _id: "p1", owner: "owner-1" });

      const res = await request(app).delete("/projects/p1");

      expect(res.statusCode).toBe(403);
      expect(Project.deleteOne).not.toHaveBeenCalled();
    });

    it("200 si owner", async () => {
      Project.findOne.mockResolvedValue({ _id: "p1", owner: "user-1" });
      Project.deleteOne.mockResolvedValue({});

      const res = await request(app).delete("/projects/p1");

      expect(res.statusCode).toBe(200);
      expect(Project.deleteOne).toHaveBeenCalledWith({ _id: "p1" });
    });
  });

  describe("addMember POST /projects/:id/members", () => {
    it("403 si ni owner ni manager", async () => {
      Project.findOne.mockResolvedValue({
        _id: "p1",
        owner: "owner-1",
        members: [],
        updateOne: jest.fn(),
      });

      const res = await request(app)
        .post("/projects/p1/members")
        .send({ userId: "user-2" });

      expect(res.statusCode).toBe(403);
    });

    it("200 si deja membre", async () => {
      Project.findOne.mockResolvedValue({
        _id: "p1",
        owner: "user-1",
        members: ["user-2"],
        updateOne: jest.fn(),
      });

      const res = await request(app)
        .post("/projects/p1/members")
        .send({ userId: "user-2" });

      expect(res.statusCode).toBe(200);
    });

    it("200 si ajoute membre", async () => {
      const projDoc = {
        _id: "p1",
        owner: "user-1",
        members: [],
        updateOne: jest.fn().mockResolvedValue({}),
      };
      Project.findOne.mockResolvedValue(projDoc);

      const res = await request(app)
        .post("/projects/p1/members")
        .send({ userId: "user-2" });

      expect(res.statusCode).toBe(200);
      expect(projDoc.updateOne).toHaveBeenCalled();
    });
  });

  describe("deleteMember DELETE /projects/:id/members/:userId", () => {
    it("403 si ni owner ni manager", async () => {
      Project.findOne.mockResolvedValue({
        _id: "p1",
        owner: "owner-1",
        members: ["user-2"],
        updateOne: jest.fn(),
      });

      const res = await request(app).delete("/projects/p1/members/user-2");

      expect(res.statusCode).toBe(403);
    });

    it("200 si pas membre", async () => {
      Project.findOne.mockResolvedValue({
        _id: "p1",
        owner: "user-1",
        members: [],
        updateOne: jest.fn(),
      });

      const res = await request(app).delete("/projects/p1/members/user-2");

      expect(res.statusCode).toBe(200);
    });

    it("200 si suppression OK", async () => {
      const projDoc = {
        _id: "p1",
        owner: "user-1",
        members: ["user-2"],
        updateOne: jest.fn().mockResolvedValue({}),
      };
      Project.findOne.mockResolvedValue(projDoc);

      const res = await request(app).delete("/projects/p1/members/user-2");

      expect(res.statusCode).toBe(200);
      expect(projDoc.updateOne).toHaveBeenCalled();
    });
  });
});
