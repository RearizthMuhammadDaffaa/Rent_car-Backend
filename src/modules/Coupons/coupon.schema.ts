import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().trim().min(2, "Code minimal 2 karakter").max(50),
  discountValue: z.number().min(0, "Discount value minimal 0"),
  usageLimit: z.number().int().min(1, "Usage limit minimal 1"),
  usedCount: z.number().int().min(0, "Used count minimal 0").default(0),
  expiredAt: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export const couponParamSchema = z.object({
  id: z.uuid(),
});

export const updateCouponSchema = createCouponSchema.partial();

export type CreateCouponDto = z.infer<typeof createCouponSchema>;
export type UpdateCouponDto = z.infer<typeof updateCouponSchema>;
export type CouponParamsDto = z.infer<typeof couponParamSchema>;
