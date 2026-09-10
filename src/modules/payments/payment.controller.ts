
import { NextFunction, Request, Response } from "express";

import { PaymentService } from "./payment.service";

import {
  paymentParamSchema,
  createPaymentSchema,
  CreatePaymentDto,
  PaymentParam,
  PaymentBookingParam,
} from "./payment.schema";



export const paymentController = {
  /**
   * Create Payment
   */
  async createPayment(
    req: Request,
    res: Response,
    next:NextFunction
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
      return next(error)
    }
  },

  /**
   * Get Payments
   */
  async getPayments(
    req: Request,
    res: Response,
    next:NextFunction
  ) {
    try {
      const payments =
        await PaymentService.getPayments();

      return res.status(200).json({
        payments,
      });
    } catch (error) {
      return next(error)
    }
  },

  /**
   * Get Payment By ID
   */
  async getPaymentById(
    req: Request<PaymentParam>,
    res: Response,
    next:NextFunction
  ) {
    try {
      const params =
        paymentParamSchema.parse(
          req.params
        );

      const payment =
        await PaymentService.getPaymentById(
          params.id,
          req.user.id,
          req.user.role
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
      return next(error)
    }
  },

  /**
   * Get Payment By Booking
   */
  async getPaymentByBookingId(
    req:Request<PaymentBookingParam>,
    res: Response,
    next:NextFunction
  ) {
    try {
      
      const bookingId =
        req.params.bookingId;

      const payment =
        await PaymentService
          .getPaymentByBookingId(
            bookingId,
            req.user.id,
            req.user.role
          );

      return res.status(200).json({
        payment,
      });
    } catch (error) {
     return next(error)
    }
  },

  /**
   * Midtrans Notification
   */
  async midtransNotification(
    req: Request,
    res: Response,
    next:NextFunction
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

      return next(error)
    }
  },
};

