import { ISSUE_STATUSES } from "@issue-tracker/shared";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();
let mongo: MongoMemoryServer;

async function registerAgent(email: string) {
  const agent = request.agent(app);
  const response = await agent.post("/api/auth/register").send({
    name: email.split("@")[0],
    email,
    password: "Password123!"
  });

  expect(response.status).toBe(201);
  return agent;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("auth", () => {
  it("registers, logs in, and returns the current user", async () => {
    const agent = await registerAgent("ada@example.com");

    const me = await agent.get("/api/auth/me");

    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe("ada@example.com");
  });

  it("rejects invalid credentials", async () => {
    await registerAgent("grace@example.com");

    const response = await request(app).post("/api/auth/login").send({
      email: "grace@example.com",
      password: "wrong-password"
    });

    expect(response.status).toBe(401);
  });
});

describe("issues", () => {
  it("creates, lists, filters, counts, and exports issues", async () => {
    const agent = await registerAgent("owner@example.com");

    const created = await agent.post("/api/issues").send({
      title: "Dashboard search is slow",
      description: "Typing in the dashboard search field should not flood the API.",
      priority: "High",
      severity: "Major"
    });

    expect(created.status).toBe(201);
    expect(created.body.status).toBe("Open");

    const list = await agent.get("/api/issues").query({ search: "dashboard", priority: "High" });
    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(1);

    const stats = await agent.get("/api/issues/stats");
    expect(stats.status).toBe(200);
    expect(stats.body).toMatchObject({ Open: 1 });
    for (const status of ISSUE_STATUSES) {
      expect(stats.body).toHaveProperty(status);
    }

    const csv = await agent.get("/api/issues/export").query({ format: "csv" });
    expect(csv.status).toBe(200);
    expect(csv.text).toContain("Dashboard search is slow");
  });

  it("allows only the creator to mutate an issue", async () => {
    const owner = await registerAgent("owner@example.com");
    const viewer = await registerAgent("viewer@example.com");

    const created = await owner.post("/api/issues").send({
      title: "Owner-only edit",
      description: "Only the original creator should be able to edit this issue.",
      priority: "Medium",
      severity: "Minor"
    });

    const forbidden = await viewer.patch(`/api/issues/${created.body.id}`).send({
      title: "Changed by viewer"
    });
    expect(forbidden.status).toBe(403);

    const resolved = await owner.patch(`/api/issues/${created.body.id}/status`).send({
      status: "Resolved"
    });
    expect(resolved.status).toBe(200);
    expect(resolved.body.status).toBe("Resolved");
  });
});
