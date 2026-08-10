import { Request, Response } from "express";
import { CouponService } from "./coupon.service";
import { couponParamSchema, CouponParamsDto } from "./coupon.schema";

export const couponController = {
  async createCoupon(req: Request, res: Response) {
    try {
      const coupon = await CouponService.createCoupon(req.body);

      return res.status(201).json({
        message: "Coupon created successfully",
        data: coupon,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async getCoupons(req: Request, res: Response) {
    try {
      const coupons = await CouponService.getCoupons();

      return res.status(200).json({
        coupons,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async getCouponById(req: Request<CouponParamsDto>, res: Response) {
    try {
      const params = couponParamSchema.parse(req.params);
      const coupon = await CouponService.getCouponById(params.id);

      return res.status(200).json({
        coupon,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async updateCoupon(req: Request<CouponParamsDto>, res: Response) {
    try {
      const params = couponParamSchema.parse(req.params);
      const coupon = await CouponService.updateCoupon(params.id, req.body);

      return res.status(200).json({
        coupon,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },

  async deleteCoupon(req: Request<CouponParamsDto>, res: Response) {
    try {
      const params = couponParamSchema.parse(req.params);
      await CouponService.deleteCoupon(params.id);

      return res.status(200).json({
        message: "Data success deleted",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  },
};
