
import crypto from "crypto";

import { prisma } from "../../config/db";
import { snap } from "../../config/midtrans";

import { NotFoundError } from "../../errors/NotFoundError";

import { paymentRepository } from "./payment.repository";

import {
  createPaymentSchema,
  midtransNotificationSchema,
  type CreatePaymentDto,
  type MidtransNotificationDto,
} from "./payment.schema";

export const PaymentService = {
  /**
   * Create Midtrans Payment
   */
  createPayment: async (
    userId: string,
    data: CreatePaymentDto
  ) => {
    const validatedData =
      createPaymentSchema.parse(data);

    /**
     * Find booking
     */
    const booking = await prisma.bookings.findUnique({
      where: {
        id: validatedData.booking_id,
      },
      include: {
        user: true,
         car: {
      include: {
        brand: true
      }
    },
      },
    });

    if (!booking) {
      throw new NotFoundError("Booking Not Found");
    }

    /**
     * Make sure booking belongs to current user
     */
    if (booking.user_id !== userId) {
      throw new Error(
        "You are not allowed to pay this booking"
      );
    }

    /**
     * Booking must be PENDING
     */
    if (booking.status !== "PENDING") {
      throw new Error(
        "Booking cannot be paid"
      );
    }

    /**
     * Check existing payment
     */
    const existingPayment =
      await paymentRepository.getByBookingId(
        booking.id
      );

    /**
     * If payment already paid
     */
    if (
      existingPayment?.status === "PAID"
    ) {
      throw new Error(
        "Booking has already been paid"
      );
    }

    /**
     * If payment is still pending
     * return existing Snap token
     */
    if (
      existingPayment?.status === "PENDING" &&
      existingPayment.snap_token
    ) {
      return {
        payment: existingPayment,
        snap_token:
          existingPayment.snap_token,
        redirect_url:
          existingPayment.redirect_url,
      };
    }

    /**
     * Generate Midtrans Order ID
     */
    const orderId =
      `BOOKING-${booking.id}`;

    const grossAmount =
      Number(booking.grandTotal);

    if (grossAmount <= 0) {
      throw new Error(
        "Invalid payment amount"
      );
    }

    /**
     * Midtrans transaction parameter
     */
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },

      customer_details: {
        first_name: booking.user.name,
        email: booking.user.email,
      },

     item_details: [
  {
    id: booking.car.id,
    price: Number(booking.pricePerDay),
    quantity: booking.total_days,
    name: `Rental ${booking.car.brand.name}`,
  },
  {
    id: `TAX-${booking.id}`,
    price: Number(booking.tax ?? 0),
    quantity: 1,
    name: "Tax",
  },
  {
    id: `DISCOUNT-${booking.id}`,
    price: -Number(booking.discount ?? 0),
    quantity: 1,
    name: "Discount",
  },
],

    };

    /**
     * Create transaction in Midtrans
     */
    const transaction =
      await snap.createTransaction(
        parameter
      );

    /**
     * Save payment to database
     */
    const payment =
      await paymentRepository.create({
        booking: {
          connect: {
            id: booking.id,
          },
        },

        order_id: orderId,

        amount:
          booking.grandTotal,

        status: "PENDING",

        snap_token:
          transaction.token,

        redirect_url:
          transaction.redirect_url,
      });

    return {
      payment,

      snap_token:
        transaction.token,

      redirect_url:
        transaction.redirect_url,
    };
  },

  /**
   * Get all payments
   */
  getPayments: async () => {
    return await paymentRepository.get();
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (
    id: string
  ) => {
    return await paymentRepository.getById(
      id
    );
  },

  /**
   * Get payment by booking
   */
  getPaymentByBookingId: async (
    bookingId: string
  ) => {
    const payment =
      await paymentRepository.getByBookingId(
        bookingId
      );

    if (!payment) {
      throw new NotFoundError(
        "Payment Not Found"
      );
    }

    return payment;
  },

  /**
   * Verify Midtrans signature
   */
  verifySignature: (
    notification: MidtransNotificationDto
  ) => {
    const serverKey =
      process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      throw new Error(
        "MIDTRANS_SERVER_KEY is not configured"
      );
    }

    const input =
      notification.order_id +
      notification.status_code +
      notification.gross_amount +
      serverKey;

    const signature =
      crypto
        .createHash("sha512")
        .update(input)
        .digest("hex");

    return (
      signature ===
      notification.signature_key
    );
  },

  /**
   * Handle Midtrans Notification
   */
  handleNotification: async (
    data: MidtransNotificationDto
  ) => {
    const notification =
      midtransNotificationSchema.parse(
        data
      );

    /**
     * Verify signature
     */
    const valid =
      PaymentService.verifySignature(
        notification
      );

    if (!valid) {
      throw new Error(
        "Invalid Midtrans Signature"
      );
    }

    /**
     * Find payment
     */
    const payment =
      await paymentRepository.getByOrderId(
        notification.order_id
      );

    if (!payment) {
      throw new NotFoundError(
        "Payment Not Found"
      );
    }

    /**
     * Check amount
     */
    const databaseAmount =
      Number(payment.amount).toFixed(2);

    const midtransAmount =
      Number(
        notification.gross_amount
      ).toFixed(2);

    if (
      databaseAmount !==
      midtransAmount
    ) {
      throw new Error(
        "Payment amount mismatch"
      );
    }

    /**
     * Idempotency
     *
     * If payment is already PAID,
     * don't process it again.
     */
    if (
      payment.status === "PAID"
    ) {
      return {
        message:
          "Payment already processed",
      };
    }

    const transactionStatus =
      notification.transaction_status;

    /**
     * SUCCESS
     */
    if (
      transactionStatus ===
      "settlement"
    ) {
      return await PaymentService
        .handleSuccessPayment(
          payment.id,
          payment.booking_id,
          notification
        );
    }

    /**
     * CAPTURE
     *
     * Used mainly for credit card
     */
    if (
      transactionStatus ===
        "capture" &&
      notification.fraud_status ===
        "accept"
    ) {
      return await PaymentService
        .handleSuccessPayment(
          payment.id,
          payment.booking_id,
          notification
        );
    }

    /**
     * PENDING
     */
    if (
      transactionStatus ===
      "pending"
    ) {
      await paymentRepository.update(
        payment.id,
        {
          status: "PENDING",

          transaction_id:
            notification.transaction_id,

          payment_type:
            notification.payment_type,
        }
      );

      return {
        message:
          "Payment is pending",
      };
    }

    /**
     * EXPIRED
     */
    if (
      transactionStatus ===
      "expire"
    ) {
      return await PaymentService
        .handleExpiredPayment(
          payment.id,
          payment.booking_id,
          notification
        );
    }

    /**
     * FAILED / CANCELLED
     */
    if (
      transactionStatus ===
        "deny" ||
      transactionStatus ===
        "cancel"
    ) {
      return await PaymentService
        .handleFailedPayment(
          payment.id,
          payment.booking_id,
          notification
        );
    }

    return {
      message:
        "Notification received",
    };
  },

  /**
   * Handle successful payment
   */
  handleSuccessPayment: async (
    paymentId: string,
    bookingId: string,
    notification: MidtransNotificationDto
  ) => {
    return await prisma.$transaction(
      async (tx) => {
        /**
         * Update payment
         */
        await tx.payments.update({
          where: {
            id: paymentId,
          },

          data: {
            status: "PAID",

            transaction_id:
              notification.transaction_id,

            payment_type:
              notification.payment_type,

            paid_at:
              new Date(),
          },
        });

        /**
         * Update booking
         */
        await tx.bookings.update({
          where: {
            id: bookingId,
          },

          data: {
            status: "CONFIRMED",
          },
        });

        return {
          message:
            "Payment successful",
        };
      }
    );
  },

  /**
   * Handle expired payment
   */
  handleExpiredPayment: async (
    paymentId: string,
    bookingId: string,
    notification: MidtransNotificationDto
  ) => {
    return await prisma.$transaction(
      async (tx) => {
        await tx.payments.update({
          where: {
            id: paymentId,
          },

          data: {
            status: "EXPIRED",

            transaction_id:
              notification.transaction_id,

            payment_type:
              notification.payment_type,

            expired_at:
              new Date(),
          },
        });

        await tx.bookings.update({
          where: {
            id: bookingId,
          },

          data: {
            status: "CANCELLED",
          },
        });

        return {
          message:
            "Payment expired",
        };
      }
    );
  },

  /**
   * Handle failed payment
   */
  handleFailedPayment: async (
    paymentId: string,
    bookingId: string,
    notification: MidtransNotificationDto
  ) => {
    return await prisma.$transaction(
      async (tx) => {
        await tx.payments.update({
          where: {
            id: paymentId,
          },

          data: {
            status: "FAILED",

            transaction_id:
              notification.transaction_id,

            payment_type:
              notification.payment_type,
          },
        });

        await tx.bookings.update({
          where: {
            id: bookingId,
          },

          data: {
            status: "CANCELLED",
          },
        });

        return {
          message:
            "Payment failed",
        };
      }
    );
  },
};

