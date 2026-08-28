import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import { bookingParamSchema, BookingParamsDto, createBookingSchema, UpdateBookingDto } from "./booking.schema";

export const BookingController = {
  async createBooking(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const validatedData = createBookingSchema.parse(req.body);
      const booking = await BookingService.createBooking(userId,validatedData);

      return res.status(201).json({
        message: "Booking Berhasil Dibuat",
        data: booking,
      });
    } catch (error) {
 return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async getBookings (req:Request,res:Response){
    try {
      const booking = await BookingService.getBooking();
      res.status(200).json({
        booking
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  },

  async getBookingById (req:Request<BookingParamsDto>,res:Response){
    try {
      const params = bookingParamSchema.parse(req.params);
      const booking = await BookingService.getBookingById(params.id);
      res.status(200).json({
        booking
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  },

   async updateVehileCat (req:Request<BookingParamsDto>,res:Response){
    try {
      const params = bookingParamSchema.parse(req.params);
      const booking = await BookingService.updateBooking(params.id, req.body);
      res.status(200).json({
        booking
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  },
   async deleteBooking (req:Request<BookingParamsDto>,res:Response){
    try {
       const params = bookingParamSchema.parse(req.params);
       await BookingService.deleteBooking(params.id);
      res.status(200).json({
        message: "Data success deleted"
      })
    } catch (error) {
       console.error(error);

      return res.status(500).json({
        error,
      });
    }

  },
    async cencelBooking (req:Request,res:Response){
       try {
    const params = bookingParamSchema.parse(req.params);

    const booking = await BookingService.cancelBooking(params.id);

    res.status(200).json({
      success: true,
      message: "Booking berhasil dibatalkan",
      data: booking,
    });
  } catch (error) {
    console.error(error);

      return res.status(500).json({
        error,
      });
  }
    }
};