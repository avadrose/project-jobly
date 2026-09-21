"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** POST /users */

describe("POST /users", function () {
  test("works for admin: create non-admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);

    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: false,
      },
      token: expect.any(String),
    });
  });

  test("works for admin: create admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);

    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: true,
      },
      token: expect.any(String),
    });
  });

  test("forbidden for non-admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: true,
      });

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "not-an-email",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(400);
  });
});


/************************************** GET /users */

describe("GET /users", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(200);

    expect(resp.body.users).toEqual(
      expect.arrayContaining([
        {
          username: "u1",
          firstName: "U1F",
          lastName: "U1L",
          email: "user1@user.com",
          isAdmin: false,
        },
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
          isAdmin: false,
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
          isAdmin: false,
        },
        {
          username: "admin",
          firstName: "Admin",
          lastName: "User",
          email: "admin@user.com",
          isAdmin: true,
        },
      ])
    );
  });

  test("forbidden for non-admin", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .get("/users");

    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    await db.query("DROP TABLE users CASCADE");

    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(500);
  });
});


/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(200);

    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
        jobs: [],
      },
    });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.user.username).toEqual("u1");
    expect(resp.body.user.jobs).toEqual([]);
  });

  test("forbidden for different user", async function () {
    const resp = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${u2Token}`);

    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .get("/users/u1");

    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .get("/users/nope")
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(404);
  });
});


/************************************** PATCH /users/:username */

describe("PATCH /users/:username", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .patch("/users/u1")
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(200);

    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .patch("/users/u1")
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.user.firstName).toEqual("New");
  });

  test("forbidden for different user", async function () {
    const resp = await request(app)
      .patch("/users/u1")
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u2Token}`);

    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch("/users/u1")
      .send({
        firstName: "New",
      });

    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
      .patch("/users/nope")
      .send({
        firstName: "Nope",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .patch("/users/u1")
      .send({
        firstName: 42,
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("works: set new password", async function () {
    const resp = await request(app)
      .patch("/users/u1")
      .send({
        password: "new-password",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });

    const isSuccessful = await User.authenticate(
      "u1",
      "new-password"
    );

    expect(isSuccessful).toBeTruthy();
  });
});


/************************************** POST /users/:username/jobs/:id */

describe("POST /users/:username/jobs/:id", function () {
  test("works for same user", async function () {
    const jobRes = await db.query(
      `SELECT id
       FROM jobs
       ORDER BY id
       LIMIT 1`
    );

    const jobId = jobRes.rows[0].id;

    const resp = await request(app)
      .post(`/users/u1/jobs/${jobId}`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      applied: jobId,
    });

    const userResp = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${u1Token}`);

    expect(userResp.body.user.jobs).toContain(jobId);
  });

  test("works for admin", async function () {
    const jobRes = await db.query(
      `SELECT id
       FROM jobs
       ORDER BY id
       LIMIT 1`
    );

    const jobId = jobRes.rows[0].id;

    const resp = await request(app)
      .post(`/users/u1/jobs/${jobId}`)
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      applied: jobId,
    });
  });

  test("forbidden for different user", async function () {
    const jobRes = await db.query(
      `SELECT id
       FROM jobs
       ORDER BY id
       LIMIT 1`
    );

    const jobId = jobRes.rows[0].id;

    const resp = await request(app)
      .post(`/users/u1/jobs/${jobId}`)
      .set("authorization", `Bearer ${u2Token}`);

    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const jobRes = await db.query(
      `SELECT id
       FROM jobs
       ORDER BY id
       LIMIT 1`
    );

    const jobId = jobRes.rows[0].id;

    const resp = await request(app)
      .post(`/users/u1/jobs/${jobId}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .post("/users/u1/jobs/999999")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(404);
  });
});


/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .delete("/users/u1")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      deleted: "u1",
    });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .delete("/users/u1")
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      deleted: "u1",
    });
  });

  test("forbidden for different user", async function () {
    const resp = await request(app)
      .delete("/users/u1")
      .set("authorization", `Bearer ${u2Token}`);

    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete("/users/u1");

    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .delete("/users/nope")
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(404);
  });
});