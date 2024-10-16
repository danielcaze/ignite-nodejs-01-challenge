import { Database } from "./database.js";
import { Task } from "./dtos/task.js";
import { TABLES } from "./enums/tables.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler(req, res) {
      const { search } = req.query;
      const tasks = database.select(TABLES.TASKS, search);

      const formattedTasks = tasks.map(
        (task) =>
          new Task(
            task.title,
            task.description,
            task.id,
            task.completed_at,
            task.created_at,
            task.updated_at
          )
      );

      return res
        .writeHead(200)
        .end(JSON.stringify({ data: formattedTasks }, null, 2));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler(req, res) {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify(
            {
              error: "Title and description are required fields.",
              status: 400,
            },
            null,
            2
          )
        );
      }

      const task = new Task(title, description);

      database.insert(TABLES.TASKS, task);

      return res.writeHead(201).end(JSON.stringify({ data: task }, null, 2));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/task/:id"),
    handler(req, res) {
      const { title, description } = req.body;

      if (
        (typeof title !== "undefined" && typeof title !== "string") ||
        (typeof description !== "undefined" && typeof description !== "string")
      ) {
        return res.writeHead(400).end(
          JSON.stringify(
            {
              error: "Title and description must be strings.",
              status: 400,
            },
            null,
            2
          )
        );
      }

      const { id } = req.params;

      const dbTask = database.get(TABLES.TASKS, id);

      if (!dbTask) {
        return res.writeHead(404).end(
          JSON.stringify(
            {
              error: "Document doest not exist",
              status: 404,
            },
            null,
            2
          )
        );
      }

      const task = new Task(
        title || dbTask.title,
        description || dbTask.description,
        dbTask.id,
        dbTask.completed_at,
        dbTask.created_at,
        Date.now()
      );

      const updatedTask = database.update(TABLES.TASKS, id, task);

      return res
        .writeHead(200)
        .end(JSON.stringify({ data: updatedTask }, null, 2));
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/task/:id/complete"),
    handler(req, res) {
      const { id } = req.params;

      const dbTask = database.get(TABLES.TASKS, id);

      if (!dbTask) {
        return res.writeHead(404).end(
          JSON.stringify(
            {
              error: "Document doest not exist",
              status: 404,
            },
            null,
            2
          )
        );
      }

      const task = new Task(
        dbTask.title,
        dbTask.description,
        dbTask.id,
        dbTask.completed_at === null ? Date.now() : null,
        dbTask.created_at,
        Date.now()
      );

      const updatedTask = database.update(TABLES.TASKS, id, task);

      return res
        .writeHead(200)
        .end(JSON.stringify({ data: updatedTask }, null, 2));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/task/:id"),
    handler(req, res) {
      const { id } = req.params;

      const dbTask = database.get(TABLES.TASKS, id);

      if (!dbTask) {
        return res.writeHead(404).end(
          JSON.stringify(
            {
              error: "Document doest not exist",
              status: 404,
            },
            null,
            2
          )
        );
      }

      const deleted = database.delete(TABLES.TASKS, id);

      if (!deleted) {
        return res.writeHead(500).end(
          JSON.stringify(
            {
              error: "Internal server error.",
              status: 500,
            },
            null,
            2
          )
        );
      }

      return res.writeHead(204).end();
    },
  },
];
