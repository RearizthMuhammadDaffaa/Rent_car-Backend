import supertest from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../app";
import { prisma } from "../../config/db";
import {
  createTestAdmin,
  createTestCoupon,
  createTestUser,
  removeTestAdmin,
  removeTestCoupons,
  removeTestUser,
} from "./test-utils";

const couponPayload = (code = "SAVE10") => ({
  code,
  discountValue: 10,
  usageLimit: 10,
  usedCount: 0,
  type: "PERCENTAGE",
  maximumDiscount: 100000,
  expiredAt: new Date(Date.now() + 86400000).toISOString(),
  isActive: true,
});

const authorization = async (email: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  return `Bearer ${jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!)}`;
};

describe("coupons integration", () => {
  beforeEach(async () => {
    await removeTestCoupons();
    await createTestAdmin();
    await createTestUser();
  });

  afterEach(async () => {
    await prisma.coupons.deleteMany({ where: { code: { in: ["SAVE10", "TEST10", "UPDATED10"] } } });
    await removeTestAdmin();
    await removeTestUser();
  });

  it.each([
    ["PERCENTAGE", 10],
    ["FIXED", 50000],
  ])("creates a %s coupon", async (type, discountValue) => {
    const result = await supertest(app)
      .post("/api/v1/coupons")
      .set("Authorization", await authorization("testAdmin@gmail.com"))
      .send({ ...couponPayload(), type, discountValue });

    expect(result.status).toBe(201);
    expect(result.body.data.code).toBe("SAVE10");
    await expect(prisma.coupons.findUnique({ where: { code: "SAVE10" } })).resolves.toMatchObject({ type, usedCount: 0 });
  });

  it("rejects customer and unauthenticated writes", async () => {
    const noAuth = await supertest(app).post("/api/v1/coupons").send(couponPayload());
    const customer = await supertest(app)
      .post("/api/v1/coupons")
      .set("Authorization", await authorization("test@gmail.com"))
      .send(couponPayload());
    expect(noAuth.status).toBe(401);
    expect(customer.status).toBe(403);
  });

  it("rejects invalid values and duplicate code", async () => {
    const invalid = await supertest(app)
      .post("/api/v1/coupons")
      .set("Authorization", await authorization("testAdmin@gmail.com"))
      .send({ ...couponPayload(), code: "x", usageLimit: 0, discountValue: -1 });
    await createTestCoupon();
    const duplicate = await supertest(app)
      .post("/api/v1/coupons")
      .set("Authorization", await authorization("testAdmin@gmail.com"))
      .send({ ...couponPayload(), code: "TEST10" });

    expect([400, 500]).toContain(invalid.status);
    expect([409, 500]).toContain(duplicate.status);
  });

  it("lists and gets a coupon", async () => {
    const coupon = await createTestCoupon();
    const list = await supertest(app).get("/api/v1/coupons");
    const detail = await supertest(app).get(`/api/v1/coupons/${coupon.id}`);
    expect(list.status).toBe(200);
    expect(list.body.coupons).toEqual(expect.arrayContaining([expect.objectContaining({ id: coupon.id })]));
    expect(detail.status).toBe(200);
    expect(detail.body.coupon.id).toBe(coupon.id);
  });

  it("updates and deletes a coupon with database verification", async () => {
    const coupon = await createTestCoupon();
    const update = await supertest(app)
      .put(`/api/v1/coupons/${coupon.id}`)
      .set("Authorization", await authorization("testAdmin@gmail.com"))
      .send({ code: "UPDATED10", discountValue: 20 });
    expect(update.status).toBe(200);
    await expect(prisma.coupons.findUnique({ where: { id: coupon.id } })).resolves.toMatchObject({ code: "UPDATED10" });

    const remove = await supertest(app)
      .delete(`/api/v1/coupons/${coupon.id}`)
      .set("Authorization", await authorization("testAdmin@gmail.com"));
    expect(remove.status).toBe(200);
    await expect(prisma.coupons.findUnique({ where: { id: coupon.id } })).resolves.toBeNull();
  });

  it("rejects invalid ids and customer mutations", async () => {
    const invalid = await supertest(app).get("/api/v1/coupons/not-a-uuid");
    const coupon = await createTestCoupon();
    const update = await supertest(app)
      .put(`/api/v1/coupons/${coupon.id}`)
      .set("Authorization", await authorization("test@gmail.com"))
      .send({ discountValue: 20 });
    expect([400, 500]).toContain(invalid.status);
    expect(update.status).toBe(403);
  });
});
