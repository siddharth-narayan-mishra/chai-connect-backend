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

// ==================== Exchange Requests ====================
// Create a new exchange request
exchangesRouter.post("/requests", auth, createExchangeRequest);

// Get all exchange requests (with filters)
exchangesRouter.get("/requests", getExchangeRequests);

// Get a specific exchange request
exchangesRouter.get("/requests/:id", getExchangeRequestById);

// Update an exchange request
exchangesRouter.put("/requests/:id", auth, updateExchangeRequest);

// Cancel an exchange request
exchangesRouter.delete("/requests/:id", auth, cancelExchangeRequest);

// ==================== Exchange Responses ====================
// Create a response to an exchange request
exchangesRouter.post("/requests/:requestId/responses", auth, createExchangeResponse);

// Get responses for a specific request
exchangesRouter.get("/requests/:requestId/responses", getExchangeResponses);

// Accept a response (starts a session)
exchangesRouter.post("/responses/:responseId/accept", auth, acceptExchangeResponse);

// Reject a response
exchangesRouter.post("/responses/:responseId/reject", auth, rejectExchangeResponse);

// ==================== Exchange Sessions ====================
// Get all sessions for the authenticated user
exchangesRouter.get("/sessions", auth, getExchangeSessions);

// Get a specific session
exchangesRouter.get("/sessions/:id", auth, getExchangeSessionById);

// Update session status/details
exchangesRouter.put("/sessions/:id", auth, updateExchangeSession);

// Confirm completion of exchange
exchangesRouter.post("/sessions/:id/confirm", auth, confirmExchangeCompletion);

// Cancel a session
exchangesRouter.delete("/sessions/:id", auth, cancelExchangeSession);

// ==================== Reviews ====================
// Create a review for a completed session
exchangesRouter.post("/sessions/:sessionId/reviews", auth, createReview);

// Get reviews (for a user or session)
exchangesRouter.get("/reviews", getReviews);

// Get a specific review
exchangesRouter.get("/reviews/:id", getReviewById);

// ==================== Disputes ====================
// Create a dispute
exchangesRouter.post("/sessions/:sessionId/disputes", auth, createDispute);

// Get disputes
exchangesRouter.get("/disputes", auth, getDisputes);

// Get a specific dispute
exchangesRouter.get("/disputes/:id", auth, getDisputeById);

// Respond to a dispute
exchangesRouter.post("/disputes/:id/respond", auth, respondToDispute);

// Resolve a dispute (admin only - you'll need to add admin middleware)
exchangesRouter.post("/disputes/:id/resolve", auth, resolveDispute);

export default exchangesRouter;