"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const {
  UnauthorizedError,
  ForbiddenError,
} = require("../expressError");


/** Authenticate user from JWT, if present. */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }

    return next();
  } catch (err) {
    return next();
  }
}


/** Require logged-in user. */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError();
    }

    return next();
  } catch (err) {
    return next(err);
  }
}


/** Require admin user. */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError();
    }

    if (!res.locals.user.isAdmin) {
      throw new ForbiddenError();
    }

    return next();
  } catch (err) {
    return next(err);
  }
}


/** Require admin OR matching username. */

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError();
    }

    if (
      res.locals.user.isAdmin ||
      res.locals.user.username === req.params.username
    ) {
      return next();
    }

    throw new ForbiddenError();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
};