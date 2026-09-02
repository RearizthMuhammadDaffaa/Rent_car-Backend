
import { Request, Response } from "express";

import { PaymentService } from "./payment.service";

import {
  paymentParamSchema,
  createPaymentSchema,
  CreatePaymentDto,
  PaymentBookingParam,
} from "./payment.schema";

import { PaymentParam } from "./payment.schema";

export const paymentController = {
  /**
   * Create Payment
   */
  async createPayment(
    req: Request,
    res: Response
  ) {
    try {
      const userId =
        req.user!.id;

      const data =
        createPaymentSchema.parse(
          req.body
        );

      const payment =
        await PaymentService.createPayment(
          userId,
          data
        );

      return res.status(201).json({
        message:
          "Payment created successfully",

        data: payment,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  /**
   * Get Payments
   */
  async getPayments(
    req: Request,
    res: Response
  ) {
    try {
      const payments =
        await PaymentService.getPayments();

      return res.status(200).json({
        payments,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  /**
   * Get Payment By ID
   */
  async getPaymentById(
    req: Request<PaymentParam>,
    res: Response
  ) {
    try {
      const params =
        paymentParamSchema.parse(
          req.params
        );

      const payment =
        await PaymentService.getPaymentById(
          params.id
        );

      if (!payment) {
        return res.status(404).json({
          message:
            "Payment Not Found",
        });
      }

      return res.status(200).json({
        payment,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  /**
   * Get Payment By Booking
   */
  async getPaymentByBookingId(
    req:Request<PaymentBookingParam>,
    res: Response
  ) {
    try {
      
      const bookingId =
        req.params.bookingId;

      const payment =
        await PaymentService
          .getPaymentByBookingId(
            bookingId
          );

      return res.status(200).json({
        payment,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  /**
   * Midtrans Notification
   */
  async midtransNotification(
    req: Request,
    res: Response
  ) {
    try {
      const result =
        await PaymentService
          .handleNotification(
            req.body
          );

      return res.status(200).json(
        result
      );
    } catch (error) {
      console.error(
        "Midtrans notification error:",
        error
      );

      return res.status(500).json({
        error,
      });
    }
  },
};

