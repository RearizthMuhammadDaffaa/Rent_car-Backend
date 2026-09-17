import supertest from "supertest";
import { createTestUser, getTestUser, removeTestUser } from "./test-utils";
import bcrypt from "bcrypt";
import { app } from "../../app";
import { prisma } from "../../config/db";
import { email } from "zod";

describe("POST api/v1/auth/sign-up", function () {
  afterEach(async () => {
    await removeTestUser();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should can register new user", async () => {
    const result = await supertest(app).post("/api/v1/auth/sign-up").send({
      email: "test@gmail.com",
      password: "rahasia",
      name: "test",
    });
    expect(result.status).toBe(201);
    expect(result.body.data.user.email).toBe("test@gmail.com");
    expect(result.body.data.user.name).toBe("test");
    expect(result.body.data.user.password).toBeUndefined();
  });

  it("should reject if email is already registered", async () => {
    let result = await supertest(app).post("/api/v1/auth/sign-up").send({
      email: "test@gmail.com",
      password: "rahasia",
      name: "test",
    });
    expect(result.status).toBe(201);
    expect(result.body.data.user.email).toBe("test@gmail.com");
    expect(result.body.data.user.name).toBe("test");
    expect(result.body.data.user.password).toBeUndefined();

    result = await supertest(app).post("/api/v1/auth/sign-up").send({
      email: "test@gmail.com",
      password: "rahasia",
      name: "test",
    });

    expect(result.status).toBe(409);
    expect(result.body.message).toBeDefined();
  });

  it("should reject if requst is invalid", async () => {
    let result = await supertest(app).post("/api/v1/auth/sign-up").send({
      email: "test.com",
      password: "test",
      name: "te",
    });

    expect(result.status).toBe(400);
    expect(result.body.message).toBeDefined();
  });

  it("should created name is 3 character and password is 6 char", async () => {
    let result = await supertest(app).post("/api/v1/auth/sign-up").send({
      email: "test@gmail.com",
      password: "test12",
      name: "tes",
    });

    expect(result.status).toBe(201);
    expect(result.body.data.user.email).toBe("test@gmail.com");
    expect(result.body.data.user.name).toBe("tes");
    expect(result.body.password).toBeUndefined();
  });

  it("should return user and token without exposing password", async () => {
    const result = await supertest(app).post("/api/v1/auth/sign-up").send({
      email: "test@gmail.com",
      password: "rahasia123",
      name: "test",
    });

    console.log("RESPONSE:", JSON.stringify(result.body, null, 2));

    expect(result.status).toBe(201);

    // response memiliki data
    expect(result.body.data).toBeDefined();

    // memiliki user
    expect(result.body.data.user).toBeDefined();

    // memiliki token
    expect(result.body.data.token).toBeDefined();

    // password tidak boleh bocor
    expect(result.body.data.user.password).toBeUndefined();
  });
});

describe("POST api/v1/auth/sign-in", function () {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it(`should can login`, async () => {
    const result = await supertest(app).post("/api/v1/auth/login").send({
      email: "test@gmail.com",
      password: "rahasia",
    });

    // Assert: HTTP status
    expect(result.status).toBe(200);

    // Assert: response body
    expect(result.body).toHaveProperty("status", "success");
    expect(result.body).toHaveProperty("data");

    expect(result.body.data).toHaveProperty("token");
    expect(typeof result.body.data.token).toBe("string");

    // Assert: user data
    expect(result.body.data.user).toHaveProperty("id");
    expect(result.body.data.user).toHaveProperty("name");
    expect(result.body.data.user).toHaveProperty("email");
    expect(result.body.data.user).toHaveProperty("role");

    // Password jangan sampai dikembalikan
    expect(result.body.data.user).not.toHaveProperty("password");

    console.log(result.headers);

    const cookies = result.headers["set-cookie"];
    console.log(cookies);

    const cookieList: string[] = Array.isArray(cookies) ? cookies : [cookies];

    const jwtCookie = cookieList.find((cookie: string) =>
      cookie.startsWith("jwt="),
    );

    const refreshTokenCookie = cookieList.find((cookie: string) =>
      cookie.startsWith("refreshToken="),
    );

    expect(jwtCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();
  });

  it("should reject if email is invalid or password is empty", async () => {
    let result = await supertest(app).post("/api/v1/auth/login").send({
      email: "test123@gmail.com",
      password: "",
    });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it(`should reject login if req is invalid`, async () => {
    const result = await supertest(app).post("/api/v1/auth/login").send({
      email: "",
      password: "",
    });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should store refresh token hash with 7 days expiry", async () => {
    // Arrange
    await removeTestUser();
    await createTestUser();

    const user = await getTestUser();

    await prisma.refreshToken.deleteMany({
      where: {
        userId: user!.id,
      },
    });

    const beforeLogin = Date.now();

    // Act
    const result = await supertest(app).post("/api/v1/auth/login").send({
      email: "test@gmail.com",
      password: "rahasia",
    });

    // Assert
    expect(result.status).toBe(200);

    const refreshToken = await prisma.refreshToken.findFirst({
      where: {
        userId: user!.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(refreshToken).not.toBeNull();

    expect(refreshToken!.userId).toBe(user!.id);
    expect(refreshToken!.tokenHash).toBeDefined();

    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    expect(refreshToken!.expiresAt.getTime()).toBeGreaterThanOrEqual(
      beforeLogin + sevenDays,
    );
  });

  it("should return 429 when login rate limit is exceeded", async () => {
    const requests = 10;

    const responses = await Promise.all(
      Array.from({ length: requests }, () =>
        supertest(app).post("/api/v1/auth/login").send({
          email: "test@gmail.com",
          password: "rahasia",
        }),
      ),
    );

    const rateLimitedResponse = responses.find(
      (response) => response.status === 429,
    );

    expect(rateLimitedResponse).toBeDefined();
  });
});

describe("DELETE api/v1/auth/logout", function () {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
  it(`should be able to logout`, async () => {
    const login = await supertest(app).post("/api/v1/auth/login").send({
      email: "test@gmail.com",
      password: "rahasia",
    });

    const loginCookies = login.headers["set-cookie"];

    const result = await supertest(app)
      .delete("/api/v1/auth/logout")
      .set("Cookie", loginCookies);

    const cookies = result.headers["set-cookie"];
    const cookieList: string[] = Array.isArray(cookies) ? cookies : [cookies];

    const jwtCookie = cookieList.find((cookie: string) =>
      cookie.startsWith("jwt="),
    );

    const refreshTokenCookie = cookieList.find((cookie: string) =>
      cookie.startsWith("refreshToken="),
    );

    console.log(cookies);

    expect(result.status).toBe(200);
    expect(jwtCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();

    expect(jwtCookie).toContain("jwt=;");
    expect(refreshTokenCookie).toContain("refreshToken=;");
  });

  it("should logout successfully without refresh token", async () => {
    const result = await supertest(app).delete("/api/v1/auth/logout");

    console.log("STATUS:", result.status);
    console.log("BODY:", JSON.stringify(result.body, null, 2));
    console.log("SET-COOKIE:", result.headers["set-cookie"]);

    expect(result.status).toBe(200);

    const cookies = result.headers["set-cookie"];

    expect(cookies).toBeDefined();
    const cookieList: string[] = Array.isArray(cookies) ? cookies : [cookies];

    const jwtCookie = cookieList.find((cookie: string) =>
      cookie.startsWith("jwt="),
    );

    const refreshTokenCookie = cookieList.find((cookie: string) =>
      cookie.startsWith("refreshToken="),
    );

    expect(jwtCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();

    expect(jwtCookie).toMatch(/jwt=;/);
    expect(refreshTokenCookie).toMatch(/refreshToken=;/);
  });

  it("should allow logout without access token", async () => {
    const result = await supertest(app).delete("/api/v1/auth/logout");

    console.log("STATUS:", result.status);
    console.log("BODY:", JSON.stringify(result.body, null, 2));

    expect(result.status).toBe(200);
  });
});
