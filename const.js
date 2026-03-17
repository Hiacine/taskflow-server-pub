require("dotenv").config();

exports.USER_ROLE = {
  MANAGER: "ROLE_MANAGER",
  USER: "ROLE_USER",
};

exports.PROJECT_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
};

exports.TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

exports.TASK_STATE = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  CLOSED: "closed",
};

// %éthode qui log en debug
exports.logDebug = (string) => {
  if (process.env.NODE_DEBUG === "true") {
    console.log("DEBUG - %s", string);
  }
};
