"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();


/** POST / { job } => { job }
 *
 * job should be:
 * { title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);

    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);

    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});


/** GET / =>
 * { jobs: [ { id, title, salary, equity, companyHandle }, ... ] }
 *
 * Can filter on:
 * - title
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const query = { ...req.query };

    if (query.minSalary !== undefined) {
      query.minSalary = Number(query.minSalary);
    }

    if (query.hasEquity !== undefined) {
      if (query.hasEquity === "true") {
        query.hasEquity = true;
      } else if (query.hasEquity === "false") {
        query.hasEquity = false;
      }
    }

    const validator = jsonschema.validate(query, jobSearchSchema);

    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const jobs = await Job.findAll(query);

    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});


/** GET /[id] => { job }
 *
 * Returns:
 * { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Fields can be:
 * { title, salary, equity }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);

    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[id] => { deleted: id }
 *
 * Authorization required: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);

    return res.json({ deleted: Number(req.params.id) });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;