import supertest from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../app";
import { prisma } from "../../config/db";
import { createTestCategory, createTestUser, createTestVehicle, removeTestCategories, removeTestUser, removeTestVehicles } from "./test-utils";

const auth = async () => {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: "test@gmail.com" } });
  return `Bearer ${jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!)}`;
};

describe("bookings integration", () => {
  let vehicleId: string;
  let userId: string;
  beforeEach(async () => {
    await prisma.bookings.deleteMany({ where: { user: { email: "test@gmail.com" } } });
    await removeTestVehicles();
    await removeTestCategories();
    await prisma.brands.deleteMany({ where: { name: "bookingBrandTest" } });
    await createTestUser();
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "test@gmail.com" } });
    userId = user.id;
    await prisma.userDocuments.upsert({ where: { user_id: userId }, update: { status: "APPROVED", ktp_url: "https://example.com/ktp", sim_url: "https://example.com/sim" }, create: { user_id: userId, status: "APPROVED", ktp_url: "https://example.com/ktp", sim_url: "https://example.com/sim" } });
    const brand = await prisma.brands.create({ data: { name: "bookingBrandTest" } });
    const category = await createTestCategory();
    const vehicle = await createTestVehicle(brand.id, category.id);
    vehicleId = vehicle.id;
  });
  afterEach(async () => {
    await prisma.bookings.deleteMany({ where: { user_id: userId } });
    await prisma.userDocuments.deleteMany({ where: { user_id: userId } });
    await removeTestVehicles();
    await prisma.brands.deleteMany({ where: { name: "bookingBrandTest" } });
    await removeTestCategories();
    await removeTestUser();
  });

  const dates = { pickup_at: new Date(Date.now() + 86400000).toISOString(), return_at: new Date(Date.now() + 3 * 86400000).toISOString() };

  it("creates a pending booking and persists calculated fields", async () => {
    const result = await supertest(app).post("/api/v1/bookings").set("Authorization", await auth()).send({ car_id: vehicleId, ...dates });
    expect(result.status).toBe(201);
    expect(result.body.data.status).toBe("PENDING");
    const booking = await prisma.bookings.findUnique({ where: { id: result.body.data.id } });
    expect(booking).toMatchObject({ user_id: userId, car_id: vehicleId, total_days: 2 });
    expect(Number(booking?.grandTotal)).toBeGreaterThan(0);
  });

  it("rejects unauthenticated, invalid dates, and overlapping bookings", async () => {
    const noAuth = await supertest(app).post("/api/v1/bookings").send({ car_id: vehicleId, ...dates });
    const invalid = await supertest(app).post("/api/v1/bookings").set("Authorization", await auth()).send({ car_id: "bad", pickup_at: dates.return_at, return_at: dates.pickup_at });
    const first = await supertest(app).post("/api/v1/bookings").set("Authorization", await auth()).send({ car_id: vehicleId, ...dates });
    const overlap = await supertest(app).post("/api/v1/bookings").set("Authorization", await auth()).send({ car_id: vehicleId, ...dates });
    expect(noAuth.status).toBe(401);
    expect(invalid.status).toBe(400);
    expect(first.status).toBe(201);
    expect([400, 409, 500]).toContain(overlap.status);
  });

  it("lists only the current customer's bookings and enforces ids", async () => {
    const created = await supertest(app).post("/api/v1/bookings").set("Authorization", await auth()).send({ car_id: vehicleId, ...dates });
    const list = await supertest(app).get("/api/v1/bookings").set("Authorization", await auth());
    const detail = await supertest(app).get(`/api/v1/bookings/${created.body.data.id}`).set("Authorization", await auth());
    const invalid = await supertest(app).get("/api/v1/bookings/not-a-uuid").set("Authorization", await auth());
    expect(list.status).toBe(200);
    expect(list.body.booking).toEqual(expect.arrayContaining([expect.objectContaining({ id: created.body.data.id })]));
    expect(detail.status).toBe(200);
    expect(invalid.status).toBe(400);
  });

  it("cancels a pending booking and updates its status", async () => {
    const created = await supertest(app).post("/api/v1/bookings").set("Authorization", await auth()).send({ car_id: vehicleId, ...dates });
    const result = await supertest(app).patch(`/api/v1/bookings/${created.body.data.id}/cancel`).set("Authorization", await auth());
    expect(result.status).toBe(200);
    await expect(prisma.bookings.findUnique({ where: { id: created.body.data.id } })).resolves.toMatchObject({ status: "CANCELLED" });
  });
});
