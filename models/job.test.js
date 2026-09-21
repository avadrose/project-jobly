"use strict";

const db = require("../db.js");
const { NotFoundError } = require("../expressError");
const Job = require("./job.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 500,
    equity: "0.25",
    companyHandle: "c1",
  };

  test("works", async function () {
    const job = await Job.create(newJob);

    expect(job).toEqual({
      id: expect.any(Number),
      title: "New Job",
      salary: 500,
      equity: "0.25",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
       FROM jobs
       WHERE id = $1`,
      [job.id]
    );

    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "New Job",
        salary: 500,
        equity: "0.25",
        company_handle: "c1",
      },
    ]);
  });
});


/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    const jobs = await Job.findAll();

    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "J1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        id: testJobIds[1],
        title: "J2",
        salary: 200,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: testJobIds[2],
        title: "J3",
        salary: 300,
        equity: "0.5",
        companyHandle: "c2",
      },
    ]);
  });

  test("works: by title", async function () {
    const jobs = await Job.findAll({ title: "1" });

    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "J1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });

  test("works: by minSalary", async function () {
    const jobs = await Job.findAll({ minSalary: 200 });

    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        title: "J2",
        salary: 200,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: testJobIds[2],
        title: "J3",
        salary: 300,
        equity: "0.5",
        companyHandle: "c2",
      },
    ]);
  });

  test("works: hasEquity true", async function () {
    const jobs = await Job.findAll({ hasEquity: true });

    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "J1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        id: testJobIds[2],
        title: "J3",
        salary: 300,
        equity: "0.5",
        companyHandle: "c2",
      },
    ]);
  });

  test("works: combined filters", async function () {
    const jobs = await Job.findAll({
      minSalary: 200,
      hasEquity: true,
    });

    expect(jobs).toEqual([
      {
        id: testJobIds[2],
        title: "J3",
        salary: 300,
        equity: "0.5",
        companyHandle: "c2",
      },
    ]);
  });
});


/************************************** get */

describe("get", function () {
  test("works", async function () {
    const job = await Job.get(testJobIds[0]);

    expect(job).toEqual({
      id: testJobIds[0],
      title: "J1",
      salary: 100,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** update */

describe("update", function () {
  test("works", async function () {
    const job = await Job.update(testJobIds[0], {
      title: "New Title",
      salary: 999,
      equity: "0.75",
    });

    expect(job).toEqual({
      id: testJobIds[0],
      title: "New Title",
      salary: 999,
      equity: "0.75",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(999999, {
        title: "Nope",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);

    const result = await db.query(
      `SELECT id
       FROM jobs
       WHERE id = $1`,
      [testJobIds[0]]
    );

    expect(result.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});