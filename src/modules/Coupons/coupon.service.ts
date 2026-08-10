import { NotFoundError } from "../../errors/NotFoundError";
import { couponRepository } from "./coupon.repository";
import {
  CreateCouponDto,
  createCouponSchema,
  UpdateCouponDto,
  updateCouponSchema,
} from "./coupon.schema";

export const CouponService = {
  createCoupon: async (data: CreateCouponDto) => {
    const couponSchema = createCouponSchema.parse(data);
    return couponRepository.create(couponSchema);
  },

  getCoupons: async () => {
    return couponRepository.get();
  },

  getCouponById: async (id: string) => {
    return couponRepository.getById(id);
  },

  updateCoupon: async (id: string, data: UpdateCouponDto) => {
    const coupon = await couponRepository.getById(id);

    if (!coupon) {
      throw new NotFoundError("Coupon Not Found");
    }

    const validatedData = updateCouponSchema.parse(data);

    return couponRepository.update(id, validatedData);
  },

  deleteCoupon: async (id: string) => {
    const coupon = await couponRepository.getById(id);

    if (!coupon) {
      throw new NotFoundError("Coupon Not Found");
    }

    return couponRepository.delete(id);
  },
};
