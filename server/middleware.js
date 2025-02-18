//
// LibreTexts Conductor
// middleware.js
//

'use strict';
import express from 'express';
import { validationResult } from 'express-validator';
import conductorErrors from './conductor-errors.js';

/**
 * Checks the results of the validation stage for an API route.
 * If there are no errors, the chain continues; otherwise, return an
 * error and the array of validation errors.
 * @param {Object} req    - the route request object
 * @param {Object} res    - the route response object
 * @param {function} next - the route's next middleware function to be ran
 */
const checkValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);
    if (validationErrors.isEmpty()) {
        next();
    } else {
        return res.status(400).send({
            err: true,
            errMsg: conductorErrors.err2,
            errors: validationErrors.array()
        });
    }
};


/**
 * Checks that the route is being run on a LibreCommons server,
 * verified via an environment variable.
 * @param {object} req - The Express.js request object.
 * @param {object} res - The Express.js response object.
 * @param {function} next - The next function in the middleware chain.
 */
const checkLibreCommons = (_req, res, next) => {
    if (process.env.ORG_ID === 'libretexts') return next();
    else {
        return res.status(403).send({
            err: true,
            msg: conductorErrors.err4
        });
    }
};


/**
 * Verifies that a request has provided a valid key from the LibreTexts API.
 * @param {object} req - The Express.js request object.
 * @param {object} res - The Express.js response object.
 * @param {function} next - The next function in the middleware chain.
 */
const checkLibreAPIKey = (req, res, next) => {
    if (typeof (req.headers?.authorization) === 'string') {
        const foundToken = req.headers.authorization.replace('Bearer ', '');
        if (!process.env.LIBRE_API_KEY || process.env.LIBRE_API_KEY.length === 0) {
            return res.status(500).send({ errMsg: conductorErrors.err6 });
        }
        if (process.env.LIBRE_API_KEY === foundToken) return next();
    }
    return res.status(401).send({ errMsg: conductorErrors.err5 });
};

/**
 * Reconstructs the Authorization header from cookies, if not already present.
 * 
 * @param {express.Request} req - Incoming request object.
 * @param {express.Response} res - Outgoing response object.
 * @param {express.NextFunction} next - Next middleware function to run.
 * @returns {express.NextFunction|express.Response} Invocation of the next middleware, or
 *  an error response.
 */
function authSanitizer(req, _res, next) {
  if (req.method !== 'OPTIONS') {
    const { cookies } = req;
    if (!req.header('authorization') && cookies.conductor_access && cookies.conductor_signed) {
      req.headers.authorization = `${cookies.conductor_access}.${cookies.conductor_signed}`;
    }
  }
  return next();
}

/**
 * Performs security checks on incoming requests by examing header values.
 *
 * @param {express.Request} req - Incoming request object. 
 * @param {express.Response} res - Outgoing response object.
 * @param {express.NextFunction} next - Next middleware function to run.
 * @returns {express.NextFunction|express.Response} An invocation of the next middleware, or
 *  an error response.
 */
function requestSecurityHelper(req, res, next) {
  if (req.method !== 'OPTIONS' && req.header('x-requested-with') !== 'XMLHttpRequest') {
    return res.status(403).send({
      err: true,
      errMsg: conductorErrors.err71,
    });
  }
  return next();
}

/**
 * Checks if a route is a member of an array of paths to exclude from the given middleware. If so,
 * the route continues its middleware chain, otherwise, the given middleware is activated.
 *
 * @param {string[]} paths - An array of paths to exclude from the middleware
 * @param {function} middleware  - The middleware function to execute if the path is not excluded.
 */
function middlewareFilter(paths, middleware) {
  return (req, res, next) => {
    if (paths.includes(req._parsedUrl.pathname)) {
      return next();
    }
    return middleware(req, res, next);
  }
}

export default {
    checkValidationErrors,
    checkLibreCommons,
    checkLibreAPIKey,
    authSanitizer,
    requestSecurityHelper,
    middlewareFilter
}
