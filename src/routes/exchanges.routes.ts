import dotenv from "dotenv";
dotenv.config();

import express, { Router } from "express";
import {
  // Exchange Requests
  createExchangeRequest,
  getExchangeRequests,
  getExchangeRequestById,
  updateExchangeRequest,
  cancelExchangeRequest,

  // Exchange Responses
  createExchangeResponse,
  getExchangeResponses,
  acceptExchangeResponse,
  rejectExchangeResponse,

  // Exchange Sessions
  getExchangeSessions,
  getExchangeSessionById,
  updateExchangeSession,
  confirmExchangeCompletion,
  cancelExchangeSession,

  // Reviews
  createReview,
  getReviews,
  getReviewById,

  // Disputes
  createDispute,
  getDisputes,
  getDisputeById,
  respondToDispute,
  resolveDispute,
} from "../controllers/exchanges.controller.ts";
import { auth } from "../middleware/auth.ts";

const exchangesRouter: Router = express.Router();

// exchange requests
exchangesRouter.post("/requests", auth, createExchangeRequest);
exchangesRouter.get("/requests", getExchangeRequests);
exchangesRouter.get("/requests/:id", getExchangeRequestById);
exchangesRouter.put("/requests/:id", auth, updateExchangeRequest);
exchangesRouter.delete("/requests/:id", auth, cancelExchangeRequest);

// exchange responses
exchangesRouter.post(
  "/requests/:requestId/responses",
  auth,
  createExchangeResponse,
);
exchangesRouter.get("/requests/:requestId/responses", getExchangeResponses);
exchangesRouter.post(
  "/responses/:responseId/accept",
  auth,
  acceptExchangeResponse,
);
exchangesRouter.post(
  "/responses/:responseId/reject",
  auth,
  rejectExchangeResponse,
);

// exchange sessions
exchangesRouter.get("/sessions", auth, getExchangeSessions);
exchangesRouter.get("/sessions/:id", auth, getExchangeSessionById);
exchangesRouter.put("/sessions/:id", auth, updateExchangeSession);
exchangesRouter.post("/sessions/:id/confirm", auth, confirmExchangeCompletion);
exchangesRouter.delete("/sessions/:id", auth, cancelExchangeSession);

// reviews
exchangesRouter.post("/sessions/:sessionId/reviews", auth, createReview);
exchangesRouter.get("/reviews", getReviews);
exchangesRouter.get("/reviews/:id", getReviewById);

// disputes
exchangesRouter.post("/sessions/:sessionId/disputes", auth, createDispute);
exchangesRouter.get("/disputes", auth, getDisputes);
exchangesRouter.get("/disputes/:id", auth, getDisputeById);
exchangesRouter.post("/disputes/:id/respond", auth, respondToDispute);
exchangesRouter.post("/disputes/:id/resolve", auth, resolveDispute);

export default exchangesRouter;
