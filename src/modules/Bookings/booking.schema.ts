import { z } from "zod";


export const createBookingSchema = z
  .object({
    car_id: z.uuid(),

    coupon_code: z.string().trim().toUpperCase().optional(),

    pickup_at: z.coerce.date(),

    return_at: z.coerce.date(),
  })
  .refine(
    (data) => data.return_at > data.pickup_at,
    {
      message: "Return date harus setelah pickup date",
      path: ["return_at"],
    }
  );



export const bookingParamSchema = z.object({
  id: z.uuid(),
});



export const updateBookingSchema = z
  .object({
    pickup_at: z.coerce.date().optional(),

    return_at: z.coerce.date().optional(),

    coupon_id: z.uuid().nullable().optional(),
  })
  .refine(
    (data) => {
      if (
        data.pickup_at &&
        data.return_at
      ) {
        return data.return_at > data.pickup_at;
      }

      return true;
    },
    {
      message:
        "Return date harus setelah pickup date",
      path: ["return_at"],
    }
  );



export const updateBookingStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "EXPIRED",
    "COMPLETED",
  ]),
});




export type CreateBookingDto =
  z.infer<typeof createBookingSchema>;

export type UpdateBookingDto =
  z.infer<typeof updateBookingSchema>;

export type BookingParamsDto =
  z.infer<typeof bookingParamSchema>;

export type UpdateBookingStatusDto =
  z.infer<typeof updateBookingStatusSchema>;