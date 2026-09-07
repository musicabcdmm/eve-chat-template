import { describe, it, expect } from "@jest/globals";
import { GET as getUsers } from "@/app/api/users/route";
import { NextRequest } from "next/server";

describe("Users API", () => {
  it("should return a list of users", async () => {
    const request = new NextRequest("http://localhost:3000/api/users");
    const response = await getUsers(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("users");
    expect(data).toHaveProperty("count");
    expect(Array.isArray(data.users)).toBe(true);
  });

  it("should support pagination", async () => {
    const request = new NextRequest("http://localhost:3000/api/users?limit=10&offset=0");
    const response = await getUsers(request);
    const data = await response.json();

    expect(data.limit).toBe(10);
    expect(data.offset).toBe(0);
  });
});
