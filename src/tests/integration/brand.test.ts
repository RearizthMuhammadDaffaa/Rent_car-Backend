import supertest from "supertest";
import {
  createTestAdmin,
  createTestBrands,
  createTestUser,
  getTestAdmin,
  getTestUser,
  removeAllTestBrands,
  removeTestAdmin,
  removeTestUser,
} from "./test-utils";
import bcrypt from "bcrypt";
import { app } from "../../app";
import { prisma } from "../../config/db";
import { email } from "zod";
import path from "path";
import fs from "fs";

describe("POST /api/vi/brands", function () {
  beforeEach(async () => {
    await createTestAdmin();
    await createTestUser();
    await createTestBrands();
  });
  afterEach(async () => {
    await removeTestAdmin();
    await removeTestUser();
    await removeAllTestBrands();
  });

  it("Should be able to create data brands", async () => {
    const login = await supertest(app).post("/api/v1/auth/login").send({
      email: "testAdmin@gmail.com",
      password: "rahasia",
    });

    expect(login.status).toBe(200);

    const cookies = login.headers["set-cookie"];
    const imagePath = path.join(
      process.cwd(),
      "src",
      "tests",
      "fixtures",
      "logo.jpeg",
    );
    const result = await supertest(app)
      .post("/api/v1/brands")
      .set("Cookie", cookies)
      .field("name", "toyotaTest")
      .attach("logo", imagePath);

    // console.log(result);
    expect(result.status).toBe(201);
    expect(result.body.data.name).toBe("toyotaTest");
    expect(result.body.data.logo).toBeDefined();
    expect(result.body.data.logoPublicId).toBeDefined();
  });

  it("should reject if the someone who create data is customer ", async () => {
    const imagePath = path.join(
      process.cwd(),
      "src",
      "tests",
      "fixtures",
      "logo.jpeg",
    );

    const login = await supertest(app).post("/api/v1/auth/login").send({
      email: "test@gmail.com",
      password: "rahasia",
    });
     const cookies = login.headers["set-cookie"];

    const result = await supertest(app)
      .post("/api/v1/brands")
      .set("Cookie", cookies)
      .field("name", "toyotaTest")
      .attach("logo", imagePath);

   
      

    expect(result.status).toBe(403);
    expect(result.body.message).toBeDefined()
    expect(result.body.message).toBe('Forbidden - insufficient permissions' )
    
  });

  it("should reject if file is not image ", async () => {
    const imagePath = path.join(
      process.cwd(),
      "src",
      "tests",
      "fixtures",
      "requirement.txt",
    );

    const login = await supertest(app).post("/api/v1/auth/login").send({
      email: "testAdmin@gmail.com",
      password: "rahasia",
    });
     const cookies = login.headers["set-cookie"];

    const result = await supertest(app)
      .post("/api/v1/brands")
      .set("Cookie", cookies)
      .field("name", "toyotaTest")
      .attach("logo", imagePath);

      console.log(result.body);
      

    expect(result.status).toBe(400);
    expect(result.body.message).toBeDefined()
    expect(result.body.message).toBe('Invalid file type. Only JPG, PNG, and WEBP are allowed.' )
    
  });
 it("should reject if file bigger than 5mb ", async () => {
    const imagePath = path.join(
      process.cwd(),
      "src",
      "tests",
      "fixtures",
      "Spanduk SLB.png",
    );

    const login = await supertest(app).post("/api/v1/auth/login").send({
      email: "testAdmin@gmail.com",
      password: "rahasia",
    });
     const cookies = login.headers["set-cookie"];

    const result = await supertest(app)
      .post("/api/v1/brands")
      .set("Cookie", cookies)
      .field("name", "toyotaTest")
      .attach("logo", imagePath);

      console.log(result.body);
      

    expect(result.status).toBe(400);
    expect(result.body.message).toBeDefined()
    expect(result.body.message).toBe('File size must not exceed 5 MB' )
    
  });

  it("should reject if there is no file ", async () => {
    const imagePath = path.join(
      process.cwd(),
      "src",
      "tests",
      "fixtures",
      "Spanduk SLB.png",
    );

    const login = await supertest(app).post("/api/v1/auth/login").send({
      email: "testAdmin@gmail.com",
      password: "rahasia",
    });
     const cookies = login.headers["set-cookie"];

    const result = await supertest(app)
      .post("/api/v1/brands")
      .set("Cookie", cookies)
      .field("name", "toyotaTest")
      .attach("logo", "");

      console.log(result.body);
      

    expect(result.status).toBe(400);
    expect(result.body.message).toBeDefined()
    expect(result.body.message).toBe('Logo is required' )
    
  });

  
});


