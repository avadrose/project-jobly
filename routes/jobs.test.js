"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "New Job",
    salary: 500,
    equity: 0.25,
    companyHandle: "c1",
  };

  test("works for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);

    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job",
        salary: 500,
        equity: "0.25",
        companyHandle: "c1",
      },
    });
  });

  test("forbidden for non-admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob);

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        salary: 500,
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "New Job",
        salary: -1,
        equity: 2,
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(400);
  });
});


/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("works for anon", async function () {
    const resp = await request(app).get("/jobs");

    expect(resp.statusCode).toEqual(200);

    expect(resp.body.jobs.length).toEqual(3);
  });

  test("works with title filter", async function () {
    const resp = await request(app)
      .get("/jobs?title=1");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
    expect(resp.body.jobs[0].title).toEqual("J1");
  });

  test("works with minSalary filter", async function () {
    const resp = await request(app)
      .get("/jobs?minSalary=200");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(2);
  });

  test("works with hasEquity filter", async function () {
    const resp = await request(app)
      .get("/jobs?hasEquity=true");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(2);
  });

  test("bad request with invalid filter", async function () {
    const resp = await request(app)
      .get("/jobs?cheese=yellow");

    expect(resp.statusCode).toEqual(400);
  });
});


/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const allResp = await request(app).get("/jobs");
    const jobId = allResp.body.jobs[0].id;

    const resp = await request(app)
      .get(`/jobs/${jobId}`);

    expect(resp.statusCode).toEqual(200);

    expect(resp.body.job).toEqual({
      id: jobId,
      title: "J1",
      salary: 100,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .get("/jobs/999999");

    expect(resp.statusCode).toEqual(404);
  });
});


/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const allResp = await request(app).get("/jobs");
    const jobId = allResp.body.jobs[0].id;

    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        title: "New Title",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.job.title).toEqual("New Title");
  });

  test("forbidden for non-admin", async function () {
    const allResp = await request(app).get("/jobs");
    const jobId = allResp.body.jobs[0].id;

    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        title: "New Title",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const allResp = await request(app).get("/jobs");
    const jobId = allResp.body.jobs[0].id;

    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        title: "New Title",
      });

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with invalid data", async function () {
    const allResp = await request(app).get("/jobs");
    const jobId = allResp.body.jobs[0].id;

    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        salary: -1,
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .patch("/jobs/999999")
      .send({
        title: "Nope",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(404);
  });
});


/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const allResp = await request(app).get("/jobs");
    const jobId = allResp.body.jobs[0].id;

    const resp = await request(app)
      .delete(`/jobs/${jobId}`)
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: jobId });
  });

  test("forbidden for non-admin", async function () {
    const allResp = await request(app).get("/jobs");
    const jobId = allResp.body.jobs[0].id;

    const resp = await request(app)
      .delete(`/jobs/${jobId}`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const allResp = await request(app).get("/jobs");
    const jobId = allResp.body.jobs[0].id;

    const resp = await request(app)
      .delete(`/jobs/${jobId}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete("/jobs/999999")
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(404);
  });
});