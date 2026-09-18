import supertest from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../app";
import { prisma } from "../../config/db";
import { createTestAdmin, createTestCategory, createTestUser, createTestVehicle, removeTestAdmin, removeTestCategories, removeTestUser, removeTestVehicles } from "./test-utils";

const auth = async (email: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  return `Bearer ${jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!)}`;
};

describe("vehicle images integration", () => {
  let vehicleId: string;
  beforeEach(async () => {
    await prisma.vehicleImage.deleteMany({ where: { image_url: "https://example.com/test-image.jpeg" } });
    await removeTestVehicles();
    await removeTestCategories();
    await prisma.brands.deleteMany({ where: { name: "imageBrandTest" } });
    await createTestAdmin();
    await createTestUser();
    const brand = await prisma.brands.create({ data: { name: "imageBrandTest" } });
    const category = await createTestCategory();
    const vehicle = await createTestVehicle(brand.id, category.id);
    vehicleId = vehicle.id;
  });
  afterEach(async () => {
    await prisma.vehicleImage.deleteMany({ where: { vehicle_id: vehicleId } });
    await removeTestVehicles();
    await prisma.brands.deleteMany({ where: { name: "imageBrandTest" } });
    await removeTestCategories();
    await removeTestAdmin();
    await removeTestUser();
  });

  it("lists vehicle images and returns an empty state when none exist", async () => {
    const result = await supertest(app).get("/api/v1/vehicle-images");
    expect(result.status).toBe(200);
    expect(result.body.vehicleImages).toEqual(expect.any(Array));
  });

  it("rejects image creation without a file and without authorization", async () => {
    const noAuth = await supertest(app).post("/api/v1/vehicle-images").field("vehicle_id", vehicleId);
    const noFile = await supertest(app).post("/api/v1/vehicle-images").set("Authorization", await auth("testAdmin@gmail.com")).field("vehicle_id", vehicleId);
    expect(noAuth.status).toBe(401);
    expect(noFile.status).toBe(400);
  });

  it("reads, updates, and deletes an existing image record", async () => {
    const image = await prisma.vehicleImage.create({ data: { vehicle_id: vehicleId, image_url: "https://example.com/test-image.jpeg", imagePublicId: "test-image" } });
    const detail = await supertest(app).get(`/api/v1/vehicle-images/${image.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.vehicleImage.id).toBe(image.id);
    const update = await supertest(app).put(`/api/v1/vehicle-images/${image.id}`).set("Authorization", await auth("testAdmin@gmail.com")).field("image_url", "https://example.com/updated.jpeg");
    expect(update.status).toBe(200);
    const remove = await supertest(app).delete(`/api/v1/vehicle-images/${image.id}`).set("Authorization", await auth("testAdmin@gmail.com"));
    expect(remove.status).toBe(200);
    await expect(prisma.vehicleImage.findUnique({ where: { id: image.id } })).resolves.toBeNull();
  });

  it("rejects invalid image ids and customer mutations", async () => {
    const invalid = await supertest(app).get("/api/v1/vehicle-images/not-a-uuid");
    const customer = await supertest(app).delete("/api/v1/vehicle-images/not-a-uuid").set("Authorization", await auth("test@gmail.com"));
    expect(invalid.status).toBe(500);
    expect(customer.status).toBe(403);
  });
});
