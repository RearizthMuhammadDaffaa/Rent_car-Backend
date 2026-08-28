import { Router } from "express";

import { BookingController } from "./booking.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
const router = Router();

router.post('/',authMiddleware(['CUSTOMER']),BookingController.createBooking)
router.get('/',BookingController.getBookings)
router.get('/:id',BookingController.getBookingById)
router.delete('/:id',authMiddleware(['CUSTOMER']),BookingController.deleteBooking)
router.patch('/:id/cancel',authMiddleware(['CUSTOMER']),BookingController.cencelBooking)

export default router;