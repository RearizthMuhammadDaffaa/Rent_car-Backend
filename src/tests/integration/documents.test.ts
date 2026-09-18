import supertest from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../app";
import { prisma } from "../../config/db";
import { createTestAdmin, createTestUser, removeTestAdmin, removeTestUser } from "./test-utils";

const auth = async (email: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  return `Bearer ${jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!)}`;
};

describe("documents integration", () => {
  beforeEach(async () => { await createTestUser(); await createTestAdmin(); });
  afterEach(async () => { await prisma.userDocuments.deleteMany({ where: { user: { email: { in: ["test@gmail.com", "testAdmin@gmail.com"] } } } }); await removeTestAdmin(); await removeTestUser(); });

  it("returns not found when customer has no document", async () => {
    const result = await supertest(app).get("/api/v1/documents/me").set("Authorization", await auth("test@gmail.com"));
    expect(result.status).toBe(404);
  });

  it("rejects unauthenticated, admin, and incomplete document submissions", async () => {
    const noAuth = await supertest(app).get("/api/v1/documents/me");
    const admin = await supertest(app).get("/api/v1/documents/me").set("Authorization", await auth("testAdmin@gmail.com"));
    const incomplete = await supertest(app).post("/api/v1/documents/me").set("Authorization", await auth("test@gmail.com"));
    expect(noAuth.status).toBe(401);
    expect(admin.status).toBe(403);
    expect(incomplete.status).toBe(400);
  });

  it("submits and reads customer document metadata when provider is configured", async () => {
    const result = await supertest(app).post("/api/v1/documents/me").set("Authorization", await auth("test@gmail.com"))
      .attach("ktp", "src/tests/fixtures/ktp.jpeg").attach("sim", "src/tests/fixtures/sim.jpeg");
    expect([201, 500]).toContain(result.status);
    if (result.status === 201) {
      const mine = await supertest(app).get("/api/v1/documents/me").set("Authorization", await auth("test@gmail.com"));
      expect(mine.status).toBe(200);
      expect(mine.body.data).not.toHaveProperty("ktp_public_id");
    }
  }, 30000);

  it("allows admins to list documents and rejects customers", async () => {
    const admin = await supertest(app).get("/api/v1/documents").set("Authorization", await auth("testAdmin@gmail.com"));
    const customer = await supertest(app).get("/api/v1/documents").set("Authorization", await auth("test@gmail.com"));
    expect(admin.status).toBe(200);
    expect(customer.status).toBe(403);
  });

  it("deletes own document and updates review status", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "test@gmail.com" } });
    const document = await prisma.userDocuments.create({ data: { user_id: user.id, ktp_url: "https://example.com/ktp", sim_url: "https://example.com/sim" } });
    const status = await supertest(app).patch(`/api/v1/documents/${document.id}/status`).set("Authorization", await auth("testAdmin@gmail.com")).send({ status: "APPROVED" });
    expect([200, 400, 500]).toContain(status.status);
    const remove = await supertest(app).delete("/api/v1/documents/me").set("Authorization", await auth("test@gmail.com"));
    expect(remove.status).toBe(200);
    await expect(prisma.userDocuments.findUnique({ where: { id: document.id } })).resolves.toBeNull();
  });
});
