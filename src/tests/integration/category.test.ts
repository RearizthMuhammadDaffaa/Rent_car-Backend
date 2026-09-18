import supertest from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../app";
import { prisma } from "../../config/db";
import {
  createTestAdmin,
  createTestCategory,
  createTestUser,
  getTestAdmin,
  removeTestAdmin,
  removeTestCategories,
  removeTestUser,
} from "./test-utils";

const authorization = async (email: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  return `Bearer ${jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!)}`;
};

describe("vehicle categories integration", () => {
  beforeEach(async () => {
    await removeTestCategories();
    await createTestAdmin();
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestCategories();
    await removeTestAdmin();
    await removeTestUser();
  });

  it("creates a category and persists it", async () => {
    const result = await supertest(app)
      .post("/api/v1/vehicle-cat")
      .set("Authorization", await authorization("testAdmin@gmail.com"))
      .send({ name: "SUV", description: "Sport utility" });

    expect(result.status).toBe(201);
    expect(result.body.data.name).toBe("SUV");
    await expect(prisma.vehicle_Categories.findUnique({ where: { id: result.body.data.id } })).resolves.toMatchObject({ name: "SUV" });
  });

  it("rejects unauthenticated and customer writes", async () => {
    const unauthenticated = await supertest(app).post("/api/v1/vehicle-cat").send({ name: "SUV" });
    const customer = await supertest(app)
      .post("/api/v1/vehicle-cat")
      .set("Authorization", await authorization("test@gmail.com"))
      .send({ name: "SUV" });

    expect(unauthenticated.status).toBe(401);
    expect(customer.status).toBe(403);
  });

  it.each([
    [{ name: "ab" }],
    [{ name: "" }],
    [{}],
  ])("rejects invalid category payload %#", async (payload) => {
    const result = await supertest(app)
      .post("/api/v1/vehicle-cat")
      .set("Authorization", await authorization("testAdmin@gmail.com"))
      .send(payload);
    expect([400, 500]).toContain(result.status);
  });

  it("lists and returns a category", async () => {
    const category = await createTestCategory();
    const list = await supertest(app).get("/api/v1/vehicle-cat");
    const detail = await supertest(app).get(`/api/v1/vehicle-cat/${category.id}`);

    expect(list.status).toBe(200);
    expect(list.body.brands).toEqual(expect.arrayContaining([expect.objectContaining({ id: category.id })]));
    expect(detail.status).toBe(200);
    expect(detail.body.vehicleCat.id).toBe(category.id);
  });

  it("returns a validation response for an invalid id", async () => {
    const result = await supertest(app).get("/api/v1/vehicle-cat/not-a-uuid");
    expect([400, 500]).toContain(result.status);
  });

  it("updates a category and verifies the database side effect", async () => {
    const category = await createTestCategory();
    const result = await supertest(app)
      .put(`/api/v1/vehicle-cat/${category.id}`)
      .set("Authorization", await authorization("testAdmin@gmail.com"))
      .send({ name: "Updated category", description: "Updated description" });

    expect(result.status).toBe(200);
    await expect(prisma.vehicle_Categories.findUnique({ where: { id: category.id } })).resolves.toMatchObject({ name: "Updated category" });
  });

  it("deletes a category and verifies it is gone", async () => {
    const category = await createTestCategory();
    const result = await supertest(app)
      .delete(`/api/v1/vehicle-cat/${category.id}`)
      .set("Authorization", await authorization("testAdmin@gmail.com"));

    expect(result.status).toBe(200);
    await expect(prisma.vehicle_Categories.findUnique({ where: { id: category.id } })).resolves.toBeNull();
  });

  it("rejects customer update and delete", async () => {
    const category = await createTestCategory();
    const update = await supertest(app)
      .put(`/api/v1/vehicle-cat/${category.id}`)
      .set("Authorization", await authorization("test@gmail.com"))
      .send({ name: "Blocked" });
    const remove = await supertest(app)
      .delete(`/api/v1/vehicle-cat/${category.id}`)
      .set("Authorization", await authorization("test@gmail.com"));

    expect(update.status).toBe(403);
    expect(remove.status).toBe(403);
  });
});
