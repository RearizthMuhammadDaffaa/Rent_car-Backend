
import { Router } from "express";

import { paymentController } from "./payment.controller";

import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

/**
 * Create Payment
 */
router.post(
  "/",
  authMiddleware(["CUSTOMER"]),
  paymentController.createPayment
);

/**
 * Get All Payments
 */
router.get(
  "/",
  authMiddleware(["ADMIN"]),
  paymentController.getPayments
);

/**
 * Get Payment By ID
 */
router.get(
  "/:id",
  authMiddleware(["CUSTOMER", "ADMIN"]),
  paymentController.getPaymentById
);

/**
 * Get Payment By Booking
 */
router.get(
  "/booking/:bookingId",
  authMiddleware(["CUSTOMER", "ADMIN"]),
  paymentController.getPaymentByBookingId
);

/**
 * Midtrans Webhook
 *
 * Do not use authMiddleware here.
 */
router.post(
  "/midtrans/notification",
  paymentController.midtransNotification
);

export default router;

