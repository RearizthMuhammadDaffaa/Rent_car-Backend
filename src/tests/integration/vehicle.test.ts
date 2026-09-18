import supertest from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../app";
import { prisma } from "../../config/db";
import { createTestAdmin, createTestCategory, createTestUser, createTestVehicle, removeTestAdmin, removeTestCategories, removeTestUser, removeTestVehicles } from "./test-utils";

const auth = async (email: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  return `Bearer ${jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!)}`;
};

describe("vehicles integration", () => {
  let brandId: string;
  let categoryId: string;

  beforeEach(async () => {
    await removeTestVehicles();
    await removeTestCategories();
    await prisma.brands.deleteMany({ where: { name: "vehicleBrandTest" } });
    await createTestAdmin();
    await createTestUser();
    const brand = await prisma.brands.create({ data: { name: "vehicleBrandTest", logo: "https://example.com/brand.jpeg" } });
    const category = await createTestCategory();
    brandId = brand.id;
    categoryId = category.id;
  });

  afterEach(async () => {
    await prisma.bookings.deleteMany({ where: { car: { brand_id: brandId } } });
    await removeTestVehicles();
    await prisma.brands.deleteMany({ where: { id: brandId } });
    await removeTestCategories();
    await removeTestAdmin();
    await removeTestUser();
  });

  it("lists vehicles and includes relationships", async () => {
    const vehicle = await createTestVehicle(brandId, categoryId);
    const result = await supertest(app).get("/api/v1/vehicles");
    expect(result.status).toBe(200);
    expect(result.body.vehicles).toEqual(expect.arrayContaining([expect.objectContaining({ id: vehicle.id, brand: expect.any(Object), category: expect.any(Object) })]));
  });

  it("gets, updates, and deletes a vehicle", async () => {
    const vehicle = await createTestVehicle(brandId, categoryId);
    const detail = await supertest(app).get(`/api/v1/vehicles/${vehicle.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.vehicle.id).toBe(vehicle.id);

    const update = await supertest(app).put(`/api/v1/vehicles/${vehicle.id}`).set("Authorization", await auth("testAdmin@gmail.com")).field("color", "White");
    expect(update.status).toBe(200);
    await expect(prisma.vehicles.findUnique({ where: { id: vehicle.id } })).resolves.toMatchObject({ color: "White" });

    const remove = await supertest(app).delete(`/api/v1/vehicles/${vehicle.id}`).set("Authorization", await auth("testAdmin@gmail.com"));
    expect(remove.status).toBe(200);
    await expect(prisma.vehicles.findUnique({ where: { id: vehicle.id } })).resolves.toBeNull();
  });

  it("rejects protected mutations and invalid ids", async () => {
    const vehicle = await createTestVehicle(brandId, categoryId);
    const noAuth = await supertest(app).delete(`/api/v1/vehicles/${vehicle.id}`);
    const customer = await supertest(app).delete(`/api/v1/vehicles/${vehicle.id}`).set("Authorization", await auth("test@gmail.com"));
    const invalid = await supertest(app).get("/api/v1/vehicles/not-a-uuid");
    expect(noAuth.status).toBe(401);
    expect(customer.status).toBe(403);
    expect([400, 500]).toContain(invalid.status);
  });

  it("rejects vehicle creation without thumbnail or with invalid fields", async () => {
    const noFile = await supertest(app).post("/api/v1/vehicles").set("Authorization", await auth("testAdmin@gmail.com")).field("brand_id", brandId).field("category_id", categoryId);
    const invalid = await supertest(app).post("/api/v1/vehicles").set("Authorization", await auth("testAdmin@gmail.com")).field("brand_id", "bad").field("category_id", categoryId).field("pricePerDay", "0");
    expect(noFile.status).toBe(400);
    expect(invalid.status).toBe(400);
  });
});
