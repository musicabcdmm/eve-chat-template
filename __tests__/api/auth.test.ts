import { describe, it, expect } from "@jest/globals";
import { POST as registerUser } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";

describe("Auth API", () => {
  it("should register a new user", async () => {
    const body = {
      name: "Test User",
      email: "test@example.com",
      password: "SecurePassword123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await registerUser(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("user");
    expect(data.user.email).toBe(body.email);
  });

  it("should reject invalid email", async () => {
    const body = {
      name: "Test User",
      email: "invalid-email",
      password: "SecurePassword123!",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await registerUser(request);
    expect(response.status).toBe(400);
  });

  it("should reject weak password", async () => {
    const body = {
      name: "Test User",
      email: "test@example.com",
      password: "weak",
    };

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await registerUser(request);
    expect(response.status).toBe(400);
  });
});
