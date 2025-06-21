import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { createApiRoutes } from "../../src/routes/apiRoutes.js";

// Create Express app for Netlify
const app = express();

// CORS setup for Netlify
app.use(cors({
  origin: "*",
  methods: ["GET"],
  credentials: true
}));

// JSON response helpers
const jsonResponse = (res, data, status = 200) =>
  res.status(status).json({ success: true, results: data });

const jsonError = (res, message = "Internal server error", status = 500) =>
  res.status(status).json({ success: false, message });

// Create API routes
createApiRoutes(app, jsonResponse, jsonError);

// Export the serverless handler
export const handler = serverless(app); 