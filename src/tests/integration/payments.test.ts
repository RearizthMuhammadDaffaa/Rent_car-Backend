import supertest from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../app";
import { prisma } from "../../config/db";
import { createTestAdmin, createTestUser, removeTestAdmin, removeTestUser } from "./test-utils";

const auth = async (email: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  return `Bearer ${jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!)}`;
};

describe("payments integration", () => {
  beforeEach(async () => { await createTestUser(); await createTestAdmin(); });
  afterEach(async () => { await prisma.payments.deleteMany({ where: { order_id: { startsWith: "TEST-" } } }); await removeTestAdmin(); await removeTestUser(); });

  it("rejects unauthenticated and admin payment creation", async () => {
    const noAuth = await supertest(app).post("/api/v1/payments").send({ booking_id: "not-a-uuid" });
    const admin = await supertest(app).post("/api/v1/payments").set("Authorization", await auth("testAdmin@gmail.com")).send({ booking_id: "not-a-uuid" });
    expect(noAuth.status).toBe(401);
    expect(admin.status).toBe(403);
  });

  it("validates payment booking ids before business processing", async () => {
    const result = await supertest(app).post("/api/v1/payments").set("Authorization", await auth("test@gmail.com")).send({ booking_id: "not-a-uuid" });
    expect(result.status).toBe(400);
  });

  it("lists payments for admins and rejects customers", async () => {
    const admin = await supertest(app).get("/api/v1/payments").set("Authorization", await auth("testAdmin@gmail.com"));
    const customer = await supertest(app).get("/api/v1/payments").set("Authorization", await auth("test@gmail.com"));
    expect(admin.status).toBe(200);
    expect(admin.body.payments).toEqual(expect.any(Array));
    expect(customer.status).toBe(403);
  });

  it("returns not found or validation for payment lookup", async () => {
    const invalid = await supertest(app).get("/api/v1/payments/not-a-uuid").set("Authorization", await auth("test@gmail.com"));
    const bookingInvalid = await supertest(app).get("/api/v1/payments/booking/not-a-uuid").set("Authorization", await auth("test@gmail.com"));
    expect(invalid.status).toBe(400);
    expect([400, 404, 500]).toContain(bookingInvalid.status);
  });

  it("rejects malformed public Midtrans notifications without changing database", async () => {
    const result = await supertest(app).post("/api/v1/payments/midtrans/notification").send({ order_id: "TEST-missing" });
    expect([400, 401, 500]).toContain(result.status);
    await expect(prisma.payments.findMany({ where: { order_id: "TEST-missing" } })).resolves.toHaveLength(0);
  });
});
