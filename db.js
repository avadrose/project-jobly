"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: getDatabaseUri(),
  password: process.env.PGPASSWORD,
  port: 5432
});

db.connect();

module.exports = db;