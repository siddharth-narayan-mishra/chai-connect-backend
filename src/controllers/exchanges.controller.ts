import type { Request, Response } from "express";
import {
  ExchangeRequest,
  ExchangeResponse,
  ExchangeSession,
  Review,
  Dispute,
  SkillListing,
  User,
  CreditTransaction,
} from "../models/index.ts";
import {
  exchangeRequestSchema,
  exchangeResponseSchema,
  reviewSchema,
  disputeSchema,
} from "../schemas/index.ts";
import { ZodError } from "zod";
import mongoose from "mongoose";
import type { AuthRequest } from "../middleware/auth.js";

// ==================== Exchange Requests ====================

// Create a new exchange request
export const createExchangeRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const validatedData = exchangeRequestSchema.parse(authReq.body);

    // Check if listing exists and is active
    const listing = await SkillListing.findById(validatedData.listing).exec();
    if (!listing) {
      res.status(404).json({ message: "Skill listing not found" });
      return;
    }

    if (listing.status !== "active") {
      res.status(400).json({ message: "This listing is no longer active" });
      return;
    }

    // Check if user is not the listing creator
    if (listing.creator.toString() === authReq.user.userId) {
      res.status(400).json({ message: "You cannot request your own listing" });
      return;
    }

    const user = await User.findById(authReq.user.userId).exec();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const exchangeRequest = new ExchangeRequest({
      ...validatedData,
      requester: authReq.user.userId,
      requesterUsername: user.username,
    });

    await exchangeRequest.save();

    // Increment response count on listing
    listing.responseCount += 1;
    await listing.save();

    res.status(201).json({
      message: "Exchange request created successfully",
      exchangeRequest,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", error: error.message });
      return;
    }
    res.status(500).json({
      message: "Error creating exchange request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all exchange requests with filters
export const getExchangeRequests = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { listing, requester, status, page = "1", limit = "20" } = req.query;

    const query: Record<string, any> = {};

    if (listing) query.listing = listing;
    if (requester) query.requester = requester;
    if (status) query.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const requests = await ExchangeRequest.find(query)
      .populate("listing", "title skills category")
      .populate("requester", "username avatar")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean()
      .exec();

    const count = await ExchangeRequest.countDocuments(query).exec();

    res.status(200).json({
      requests,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalRequests: count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching exchange requests",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get a specific exchange request
export const getExchangeRequestById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: "Invalid request ID" });
      return;
    }

    const exchangeRequest = await ExchangeRequest.findById(req.params.id)
      .populate("listing")
      .populate("requester", "username avatar bio skills")
      .lean()
      .exec();

    if (!exchangeRequest) {
      res.status(404).json({ message: "Exchange request not found" });
      return;
    }

    res.status(200).json({ exchangeRequest });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching exchange request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update an exchange request
export const updateExchangeRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (
      !authReq.params.id ||
      !mongoose.Types.ObjectId.isValid(authReq.params.id)
    ) {
      res.status(400).json({ message: "Invalid request ID" });
      return;
    }

    const exchangeRequest = await ExchangeRequest.findById(authReq.params.id).exec();

    if (!exchangeRequest) {
      res.status(404).json({ message: "Exchange request not found" });
      return;
    }

    // Check if user is the requester
    if (exchangeRequest.requester.toString() !== authReq.user.userId) {
      res
        .status(403)
        .json({ message: "You don't have permission to update this request" });
      return;
    }

    // Can only update pending requests
    if (exchangeRequest.status !== "pending") {
      res.status(400).json({ message: "Can only update pending requests" });
      return;
    }

    const validatedData = exchangeRequestSchema.partial().parse(authReq.body);

    // Update allowed fields
    const allowedUpdates = ["message", "proposedCredits", "proposedSkills"];
    allowedUpdates.forEach((field) => {
      if ((validatedData as any)[field] !== undefined) {
        (exchangeRequest as any)[field] = (validatedData as any)[field];
      }
    });

    await exchangeRequest.save();

    res.status(200).json({
      message: "Exchange request updated successfully",
      exchangeRequest,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", error: error.message });
      return;
    }
    res.status(500).json({
      message: "Error updating exchange request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Cancel an exchange request
export const cancelExchangeRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (
      !authReq.params.id ||
      !mongoose.Types.ObjectId.isValid(authReq.params.id)
    ) {
      res.status(400).json({ message: "Invalid request ID" });
      return;
    }

    const exchangeRequest = await ExchangeRequest.findById(authReq.params.id).exec();

    if (!exchangeRequest) {
      res.status(404).json({ message: "Exchange request not found" });
      return;
    }

    if (exchangeRequest.requester.toString() !== authReq.user.userId) {
      res
        .status(403)
        .json({ message: "You don't have permission to cancel this request" });
      return;
    }

    if (exchangeRequest.status !== "pending") {
      res.status(400).json({ message: "Can only cancel pending requests" });
      return;
    }

    exchangeRequest.status = "cancelled";
    await exchangeRequest.save();

    res
      .status(200)
      .json({ message: "Exchange request cancelled successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error cancelling exchange request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== Exchange Responses ====================

// Create a response to an exchange request
export const createExchangeResponse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const requestId = authReq.params.requestId;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      res.status(400).json({ message: "Invalid request ID" });
      return;
    }

    const exchangeRequest = await ExchangeRequest.findById(requestId)
      .populate("listing")
      .exec();

    if (!exchangeRequest) {
      res.status(404).json({ message: "Exchange request not found" });
      return;
    }

    if (exchangeRequest.status !== "pending") {
      res.status(400).json({ message: "This request is no longer pending" });
      return;
    }

    // Check if user is the listing creator
    const listing = exchangeRequest.listing as any;
    if (listing.creator.toString() !== authReq.user.userId) {
      res
        .status(403)
        .json({
          message: "Only the listing creator can respond to this request",
        });
      return;
    }

    // Check if response already exists
    const existingResponse = await ExchangeResponse.findOne({
      exchangeRequest: requestId,
    }).exec();
    if (existingResponse) {
      res
        .status(400)
        .json({ message: "You have already responded to this request" });
      return;
    }

    const user = await User.findById(authReq.user.userId).exec();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const validatedData = exchangeResponseSchema.parse({
      ...authReq.body,
      exchangeRequest: requestId,
    });

    const exchangeResponse = new ExchangeResponse({
      ...validatedData,
      responder: authReq.user.userId,
      responderUsername: user.username,
    });

    await exchangeResponse.save();

    res.status(201).json({
      message: "Response created successfully",
      exchangeResponse,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", error: error.message });
      return;
    }
    res.status(500).json({
      message: "Error creating response",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get responses for a request
export const getExchangeResponses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const requestId = req.params.requestId;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      res.status(400).json({ message: "Invalid request ID" });
      return;
    }

    const responses = await ExchangeResponse.find({
      exchangeRequest: requestId,
    })
      .populate("responder", "username avatar")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({ responses });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching responses",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Accept a response (creates exchange session)
export const acceptExchangeResponse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const responseId = authReq.params.responseId;

    if (!responseId || !mongoose.Types.ObjectId.isValid(responseId)) {
      res.status(400).json({ message: "Invalid response ID" });
      return;
    }

    const exchangeResponse = await ExchangeResponse.findById(responseId)
      .populate("exchangeRequest")
      .exec();

    if (!exchangeResponse) {
      res.status(404).json({ message: "Response not found" });
      return;
    }

    const exchangeRequest = exchangeResponse.exchangeRequest as any;

    // Check if user is the requester
    if (exchangeRequest.requester.toString() !== authReq.user.userId) {
      res
        .status(403)
        .json({ message: "Only the requester can accept responses" });
      return;
    }

    if (exchangeResponse.status !== "accepted") {
      res
        .status(400)
        .json({ message: "This response is not in accepted status" });
      return;
    }

    // Create exchange session
    const session = new ExchangeSession({
      listing: exchangeRequest.listing,
      exchangeRequest: exchangeRequest._id,
      requestor: exchangeRequest.requester,
      responder: exchangeResponse.responder,
      exchangeDetails: {
        creditsAmount: exchangeRequest.proposedCredits,
        creditsPayer:
          exchangeRequest.proposedCredits > 0
            ? exchangeRequest.requester
            : null,
      },
      status: "scheduled",
    });

    await session.save();

    // Update request status
    exchangeRequest.status = "accepted";
    await exchangeRequest.save();

    res.status(201).json({
      message: "Exchange session created successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting response",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Reject a response
export const rejectExchangeResponse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const responseId = authReq.params.responseId;

    if (!responseId || !mongoose.Types.ObjectId.isValid(responseId)) {
      res.status(400).json({ message: "Invalid response ID" });
      return;
    }

    const exchangeResponse = await ExchangeResponse.findById(responseId)
      .populate("exchangeRequest")
      .exec();

    if (!exchangeResponse) {
      res.status(404).json({ message: "Response not found" });
      return;
    }

    const exchangeRequest = exchangeResponse.exchangeRequest as any;

    if (exchangeRequest.requester.toString() !== authReq.user.userId) {
      res
        .status(403)
        .json({ message: "Only the requester can reject responses" });
      return;
    }

    exchangeResponse.status = "rejected";
    await exchangeResponse.save();

    res.status(200).json({ message: "Response rejected successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error rejecting response",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== Exchange Sessions ====================

// Get all sessions for authenticated user
export const getExchangeSessions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { status, page = "1", limit = "20" } = authReq.query;

    const query: Record<string, any> = {
      $or: [
        { requestor: authReq.user.userId },
        { responder: authReq.user.userId },
      ],
    };

    if (status) query.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const sessions = await ExchangeSession.find(query)
      .populate("listing", "title skills")
      .populate("requestor", "username avatar")
      .populate("responder", "username avatar")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean()
      .exec();

    const count = await ExchangeSession.countDocuments(query).exec();

    res.status(200).json({
      sessions,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalSessions: count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sessions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get a specific session
export const getExchangeSessionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (
      !authReq.params.id ||
      !mongoose.Types.ObjectId.isValid(authReq.params.id)
    ) {
      res.status(400).json({ message: "Invalid session ID" });
      return;
    }

    const session = await ExchangeSession.findById(authReq.params.id)
      .populate("listing")
      .populate("exchangeRequest")
      .populate("requestor", "username avatar bio skills")
      .populate("responder", "username avatar bio skills")
      .lean()
      .exec();

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    // Check if user is part of the session
    if (
      session.requestor._id.toString() !== authReq.user.userId &&
      session.responder._id.toString() !== authReq.user.userId
    ) {
      res
        .status(403)
        .json({ message: "You don't have access to this session" });
      return;
    }

    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update session
export const updateExchangeSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (
      !authReq.params.id ||
      !mongoose.Types.ObjectId.isValid(authReq.params.id)
    ) {
      res.status(400).json({ message: "Invalid session ID" });
      return;
    }

    const session = await ExchangeSession.findById(authReq.params.id).exec();

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    // Check if user is part of the session
    if (
      session.requestor.toString() !== authReq.user.userId &&
      session.responder.toString() !== authReq.user.userId
    ) {
      res
        .status(403)
        .json({ message: "You don't have access to this session" });
      return;
    }

    const { status, startDate, endDate } = authReq.body;

    if (status) session.status = status;
    if (startDate) session.startDate = new Date(startDate);
    if (endDate) session.endDate = new Date(endDate);

    await session.save();

    res.status(200).json({
      message: "Session updated successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Confirm exchange completion
export const confirmExchangeCompletion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (
      !authReq.params.id ||
      !mongoose.Types.ObjectId.isValid(authReq.params.id)
    ) {
      res.status(400).json({ message: "Invalid session ID" });
      return;
    }

    const session = await ExchangeSession.findById(authReq.params.id).exec();

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    const userId = authReq.user.userId;
    const isRequestor = session.requestor.toString() === userId;
    const isResponder = session.responder.toString() === userId;

    if (!isRequestor && !isResponder) {
      res
        .status(403)
        .json({ message: "You don't have access to this session" });
      return;
    }

    // Mark confirmation
    if (isRequestor) {
      session.requestorConfirmed = true;
    }
    if (isResponder) {
      session.responderConfirmed = true;
    }

    // If both confirmed, mark as completed and process credits
    if (session.requestorConfirmed && session.responderConfirmed) {
      session.status = "completed";
      session.completedDate = new Date();

      // Process credit transaction if applicable
      if (session.exchangeDetails!.creditsAmount > 0) {
        const transaction = new CreditTransaction({
          from: session.exchangeDetails!.creditsPayer,
          to:
            session.exchangeDetails!.creditsPayer!.toString() ===
            session.requestor.toString()
              ? session.responder
              : session.requestor,
          amount: session.exchangeDetails!.creditsAmount,
          type: "exchange",
          relatedExchange: session._id,
          status: "completed",
        });
        await transaction.save();
      }
    }

    await session.save();

    res.status(200).json({
      message: "Confirmation recorded successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error confirming completion",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Cancel session
export const cancelExchangeSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (
      !authReq.params.id ||
      !mongoose.Types.ObjectId.isValid(authReq.params.id)
    ) {
      res.status(400).json({ message: "Invalid session ID" });
      return;
    }

    const session = await ExchangeSession.findById(authReq.params.id).exec();

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    if (
      session.requestor.toString() !== authReq.user.userId &&
      session.responder.toString() !== authReq.user.userId
    ) {
      res
        .status(403)
        .json({ message: "You don't have access to this session" });
      return;
    }

    if (session.status === "completed") {
      res.status(400).json({ message: "Cannot cancel a completed session" });
      return;
    }

    session.status = "cancelled";
    await session.save();

    res.status(200).json({ message: "Session cancelled successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error cancelling session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== Reviews ====================

// Create a review
export const createReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const sessionId = authReq.params.sessionId;

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      res.status(400).json({ message: "Invalid session ID" });
      return;
    }

    const session = await ExchangeSession.findById(sessionId).exec();

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    if (session.status !== "completed") {
      res.status(400).json({ message: "Can only review completed sessions" });
      return;
    }

    const userId = authReq.user.userId;
    const isRequestor = session.requestor.toString() === userId;
    const isResponder = session.responder.toString() === userId;

    if (!isRequestor && !isResponder) {
      res
        .status(403)
        .json({ message: "You don't have access to this session" });
      return;
    }

    const revieweeId = isRequestor ? session.responder : session.requestor;

    // Check if review already exists
    const existingReview = await Review.findOne({
      exchangeSession: sessionId,
      reviewer: userId,
    }).exec();

    if (existingReview) {
      res
        .status(400)
        .json({ message: "You have already reviewed this session" });
      return;
    }

    const validatedData = reviewSchema.parse({
      ...authReq.body,
      exchangeSession: sessionId,
      reviewer: userId,
      reviewee: revieweeId,
    });

    const review = new Review(validatedData);
    await review.save();

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", error: error.message });
      return;
    }
    res.status(500).json({
      message: "Error creating review",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get reviews
export const getReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reviewee, session, page = "1", limit = "20" } = req.query;

    const query: Record<string, any> = {};

    if (reviewee) query.reviewee = reviewee;
    if (session) query.exchangeSession = session;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const reviews = await Review.find(query)
      .populate("reviewer", "username avatar")
      .populate("reviewee", "username avatar")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean()
      .exec();

    const count = await Review.countDocuments(query).exec();

    res.status(200).json({
      reviews,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalReviews: count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching reviews",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get a specific review
export const getReviewById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: "Invalid review ID" });
      return;
    }

    const review = await Review.findById(req.params.id)
      .populate("reviewer", "username avatar")
      .populate("reviewee", "username avatar")
      .populate("exchangeSession")
      .lean()
      .exec();

    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    res.status(200).json({ review });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching review",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== Disputes ====================

// Create a dispute
export const createDispute = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const sessionId = authReq.params.sessionId;

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      res.status(400).json({ message: "Invalid session ID" });
      return;
    }

    const session = await ExchangeSession.findById(sessionId).exec();

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    const userId = authReq.user.userId;
    const isRequestor = session.requestor.toString() === userId;
    const isResponder = session.responder.toString() === userId;

    if (!isRequestor && !isResponder) {
      res
        .status(403)
        .json({ message: "You don't have access to this session" });
      return;
    }

    // Check if dispute already exists
    const existingDispute = await Dispute.findOne({
      exchangeSession: sessionId,
      status: { $in: ["open", "under_review", "escalated"] },
    }).exec();

    if (existingDispute) {
      res
        .status(400)
        .json({ message: "An active dispute already exists for this session" });
      return;
    }

    const respondentId = isRequestor ? session.responder : session.requestor;

    const validatedData = disputeSchema.parse({
      ...authReq.body,
      exchangeSession: sessionId,
      initiator: userId,
      respondent: respondentId,
    });

    const dispute = new Dispute(validatedData);
    await dispute.save();

    // Update session status
    session.status = "disputed";
    await session.save();

    res.status(201).json({
      message: "Dispute created successfully",
      dispute,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", error: error.message });
      return;
    }
    res.status(500).json({
      message: "Error creating dispute",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get disputes
export const getDisputes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { status, page = "1", limit = "20" } = authReq.query;

    const query: Record<string, any> = {
      $or: [
        { initiator: authReq.user.userId },
        { respondent: authReq.user.userId },
      ],
    };

    if (status) query.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const disputes = await Dispute.find(query)
      .populate("exchangeSession")
      .populate("initiator", "username avatar")
      .populate("respondent", "username avatar")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean()
      .exec();

    const count = await Dispute.countDocuments(query).exec();

    res.status(200).json({
      disputes,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalDisputes: count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching disputes",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get a specific dispute
export const getDisputeById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (
      !authReq.params.id ||
      !mongoose.Types.ObjectId.isValid(authReq.params.id)
    ) {
      res.status(400).json({ message: "Invalid dispute ID" });
      return;
    }

    const dispute = await Dispute.findById(authReq.params.id)
      .populate("exchangeSession")
      .populate("initiator", "username avatar")
      .populate("respondent", "username avatar")
      .lean()
      .exec();

    if (!dispute) {
      res.status(404).json({ message: "Dispute not found" });
      return;
    }

    // Check if user is part of the dispute
    if (
      dispute.initiator._id.toString() !== authReq.user.userId &&
      dispute.respondent._id.toString() !== authReq.user.userId
    ) {
      res
        .status(403)
        .json({ message: "You don't have access to this dispute" });
      return;
    }

    res.status(200).json({ dispute });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dispute",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Respond to a dispute
export const respondToDispute = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (
      !authReq.params.id ||
      !mongoose.Types.ObjectId.isValid(authReq.params.id)
    ) {
      res.status(400).json({ message: "Invalid dispute ID" });
      return;
    }

    const dispute = await Dispute.findById(authReq.params.id).exec();

    if (!dispute) {
      res.status(404).json({ message: "Dispute not found" });
      return;
    }

    // Only respondent can respond
    if (dispute.respondent.toString() !== authReq.user.userId) {
      res
        .status(403)
        .json({ message: "Only the respondent can respond to this dispute" });
      return;
    }

    if (dispute.status !== "open") {
      res.status(400).json({ message: "Can only respond to open disputes" });
      return;
    }

    const { respondentResponse } = authReq.body;

    if (
      !respondentResponse ||
      respondentResponse.length < 20 ||
      respondentResponse.length > 2000
    ) {
      res
        .status(400)
        .json({ message: "Response must be between 20 and 2000 characters" });
      return;
    }

    dispute.respondentResponse = respondentResponse;
    dispute.status = "under_review";
    await dispute.save();

    res.status(200).json({
      message: "Response submitted successfully",
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error responding to dispute",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Resolve a dispute (admin function)
export const resolveDispute = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (
      !authReq.params.id ||
      !mongoose.Types.ObjectId.isValid(authReq.params.id)
    ) {
      res.status(400).json({ message: "Invalid dispute ID" });
      return;
    }

    const dispute = await Dispute.findById(authReq.params.id).exec();

    if (!dispute) {
      res.status(404).json({ message: "Dispute not found" });
      return;
    }

    // TODO: Add admin check here
    // For now, allowing any authenticated user to resolve (you should add admin middleware)

    const { resolution, status } = authReq.body;

    if (!resolution || resolution.length > 1000) {
      res
        .status(400)
        .json({
          message: "Resolution must be provided and under 1000 characters",
        });
      return;
    }

    if (!["resolved", "closed"].includes(status)) {
      res
        .status(400)
        .json({ message: "Status must be either 'resolved' or 'closed'" });
      return;
    }

    dispute.resolution = resolution;
    dispute.status = status;
    dispute.resolvedAt = new Date();
    await dispute.save();

    res.status(200).json({
      message: "Dispute resolved successfully",
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resolving dispute",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}