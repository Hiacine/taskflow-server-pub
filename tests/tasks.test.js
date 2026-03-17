process.env.NODE_ENV = "test";
const request = require("supertest");

// Mocks AVANT d'importer app
jest.mock("../middlwares/auth", () => (req, res, next) => {
  req.auth = { userId: "user-1" };
  next();
});

jest.mock("../models/project", () => ({
  findOne: jest.fn(),
}));

jest.mock("../models/task", () => {
  const ctor = jest.fn();
  ctor.aggregate = jest.fn();
  ctor.deleteOne = jest.fn();
  ctor.find = jest.fn();
  ctor.findOne = jest.fn();
  ctor.updateOne = jest.fn();
  return ctor;
});

// Charger l'app après les mocks
const app = require("../app");
const Project = require("../models/project");
const Task = require("../models/task");

describe("Tasks controller", () => {
  const PROJ_ID = "507f1f77bcf86cd799439011";
  const TASK_ID = "507f1f77bcf86cd799439012";

  beforeEach(() => jest.clearAllMocks());

  describe("addTask POST /projects/:id/tasks", () => {
    it("200 si owner", async () => {
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "user-1" });
      Task.mockImplementation((doc) => ({
        ...doc,
        save: jest.fn().mockResolvedValue({ _id: "task-1" }),
      }));

      const res = await request(app)
        .post(`/projects/${PROJ_ID}/tasks`)
        .send({ title: "T1" });

      expect(res.statusCode).toBe(200);
      expect(Task).toHaveBeenCalledWith(
        expect.objectContaining({ project: PROJ_ID, title: "T1" })
      );
    });

    it("403 si pas owner", async () => {
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "other" });

      const res = await request(app)
        .post(`/projects/${PROJ_ID}/tasks`)
        .send({ title: "T1" });

      expect(res.statusCode).toBe(403);
      expect(Task).not.toHaveBeenCalled();
    });

    it("401 si projet introuvable", async () => {
      Project.findOne.mockRejectedValue(new Error("not found"));

      const res = await request(app)
        .post(`/projects/${PROJ_ID}/tasks`)
        .send({ title: "T1" });

      expect(res.statusCode).toBe(401);
    });

    it("400 si echec de creation de tache", async () => {
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "user-1" });
      Task.mockImplementation((doc) => ({
        ...doc,
        save: jest.fn().mockRejectedValue(new Error("save error")),
      }));

      const res = await request(app)
        .post(`/projects/${PROJ_ID}/tasks`)
        .send({ title: "T1" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("A problem occurs creating task!");
    });
  });

  describe("getProjectTasks GET /projects/:id/tasks", () => {
    it("401 si pas owner", async () => {
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "other" });

      const res = await request(app).get(`/projects/${PROJ_ID}/tasks`);

      expect(res.statusCode).toBe(401);
      expect(Task.aggregate).not.toHaveBeenCalled();
    });

    it("200 et appelle aggregate si owner", async () => {
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "user-1" });
      Task.aggregate.mockResolvedValue([{ data: [], metaData: [] }]);

      const res = await request(app).get(`/projects/${PROJ_ID}/tasks`);

      expect(res.statusCode).toBe(200);
      expect(Task.aggregate).toHaveBeenCalled();
    });
  });

  describe("closeTask / openTask", () => {
    it("closeTask 200 si assignee", async () => {
      Task.findOne.mockResolvedValue({ _id: "t1", assignee: "user-1" });
      Task.updateOne.mockResolvedValue({});

      const res = await request(app).post(`/tasks/${TASK_ID}/close`);
      expect(res.statusCode).toBe(200);
    });

    it("closeTask 401 si pas assignee", async () => {
      Task.findOne.mockResolvedValue({ _id: "t1", assignee: "other" });

      const res = await request(app).post(`/tasks/${TASK_ID}/close`);
      expect(res.statusCode).toBe(401);
      expect(Task.updateOne).not.toHaveBeenCalled();
    });

    it("openTask 200 si assignee", async () => {
      Task.findOne.mockResolvedValue({ _id: "t1", assignee: "user-1" });
      Task.updateOne.mockResolvedValue({});

      const res = await request(app).post(`/tasks/${TASK_ID}/open`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe("modifyTask PATCH /tasks/:id", () => {
    it("403 si ni owner ni assignee", async () => {
      Task.findOne.mockResolvedValue({ _id: TASK_ID, project: PROJ_ID, assignee: "other" });
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "owner-1" });

      const res = await request(app).patch(`/tasks/${TASK_ID}`).send({ title: "X" });
      expect(res.statusCode).toBe(403);
      expect(Task.updateOne).not.toHaveBeenCalled();
    });

    it("200 si owner", async () => {
      Task.findOne.mockResolvedValue({ _id: TASK_ID, project: PROJ_ID, assignee: "other" });
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "user-1" });
      Task.updateOne.mockResolvedValue({});

      const res = await request(app).patch(`/tasks/${TASK_ID}`).send({ title: "X" });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("findOneTask GET /tasks/:id", () => {
    it("200 et retourne la tache", async () => {
      Task.find.mockResolvedValue([{ _id: TASK_ID }]);

      const res = await request(app).get(`/tasks/${TASK_ID}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("getTasksByIds GET /tasks/tasksbyids", () => {
    it("200 et retourne les taches demandees", async () => {
      Task.find.mockResolvedValue([{ _id: "t1" }, { _id: "t2" }]);

      const res = await request(app)
        .get("/tasks/tasksbyids")
        .send({ tasksIds: ["t1", "t2"] });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(Task.find).toHaveBeenCalledWith({ _id: { $in: ["t1", "t2"] } });
    });
  });

  describe("deleteTask DELETE /tasks/:id", () => {
    it("200 quand suppression OK", async () => {
      Task.deleteOne.mockResolvedValue({});

      const res = await request(app).delete(`/tasks/${TASK_ID}`);

      expect(res.statusCode).toBe(200);
      expect(Task.deleteOne).toHaveBeenCalledWith({ _id: TASK_ID });
    });
  });

  describe("addAssignee / deleteAssignee", () => {
    it("addAssignee 200 si owner", async () => {
      Task.findOne.mockResolvedValue({ _id: TASK_ID, project: PROJ_ID });
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "user-1" });
      Task.updateOne.mockResolvedValue({});

      const res = await request(app)
        .post(`/tasks/${TASK_ID}/assignee`)
        .send({ assignee: "user-2" });

      expect(res.statusCode).toBe(200);
      expect(Task.updateOne).toHaveBeenCalled();
    });

    it("addAssignee 402 si pas owner", async () => {
      Task.findOne.mockResolvedValue({ _id: TASK_ID, project: PROJ_ID });
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "other" });

      const res = await request(app)
        .post(`/tasks/${TASK_ID}/assignee`)
        .send({ assignee: "user-2" });

      expect(res.statusCode).toBe(402);
      expect(Task.updateOne).not.toHaveBeenCalled();
    });

    it("deleteAssignee 200 si owner", async () => {
      Task.findOne.mockResolvedValue({ _id: TASK_ID, project: PROJ_ID });
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "user-1" });
      Task.updateOne.mockResolvedValue({});

      const res = await request(app).delete(`/tasks/${TASK_ID}/assignee`);

      expect(res.statusCode).toBe(200);
      expect(Task.updateOne).toHaveBeenCalled();
    });
  });

  describe("addTagToTask / deleteTagFomTask", () => {
    it("addTagToTask 200 si owner", async () => {
      const taskDoc = {
        _id: TASK_ID,
        project: PROJ_ID,
        tags: [],
        updateOne: jest.fn().mockResolvedValue({}),
      };
      Task.findOne.mockResolvedValue(taskDoc);
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "user-1", members: [] });

      const res = await request(app).post(`/tasks/${TASK_ID}/tags/tag-1`);

      expect(res.statusCode).toBe(200);
      expect(taskDoc.updateOne).toHaveBeenCalled();
    });

    it("deleteTagFomTask 200 si tag present", async () => {
      const taskDoc = {
        _id: TASK_ID,
        project: PROJ_ID,
        tags: ["tag-1"],
        updateOne: jest.fn().mockResolvedValue({}),
      };
      Task.findOne.mockResolvedValue(taskDoc);
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "user-1", members: [] });

      const res = await request(app).delete(`/tasks/${TASK_ID}/tags/tag-1`);

      expect(res.statusCode).toBe(200);
      expect(taskDoc.updateOne).toHaveBeenCalled();
    });

    it("deleteTagFomTask 404 si tag absent", async () => {
      const taskDoc = {
        _id: TASK_ID,
        project: PROJ_ID,
        tags: [],
        updateOne: jest.fn().mockResolvedValue({}),
      };
      Task.findOne.mockResolvedValue(taskDoc);
      Project.findOne.mockResolvedValue({ _id: PROJ_ID, owner: "user-1", members: [] });

      const res = await request(app).delete(`/tasks/${TASK_ID}/tags/tag-1`);

      expect(res.statusCode).toBe(404);
      expect(taskDoc.updateOne).not.toHaveBeenCalled();
    });
  });
});
