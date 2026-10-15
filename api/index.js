/**
 * Drishti-Skilling: Vercel Serverless Function Entrypoint
 * Forwards all incoming API requests to the Express application.
 */

const app = require('../server/index');

module.exports = app;
