
import { z } from "zod";

export const createPaymentSchema = z.object({
  booking_id: z.uuid(),
});

export const paymentParamSchema = z.object({
  id: z.uuid(),
});
export const paymentBookingParamSchema = z.object({
  bookingId: z.uuid(),
});

export const midtransNotificationSchema = z.object({
  order_id: z.string(),
  transaction_id: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
  payment_type: z.string().optional(),
  gross_amount: z.string(),
  status_code: z.string(),
  signature_key: z.string(),
});

export type PaymentBookingParam = z.infer<
  typeof paymentBookingParamSchema
>;

export type CreatePaymentDto = z.infer<
  typeof createPaymentSchema
>;

export type PaymentParam = z.infer<
  typeof paymentParamSchema
>;

export type MidtransNotificationDto = z.infer<
  typeof midtransNotificationSchema
>;

