import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { hashPassword, verifyPassword, validatePassword, calculatePasswordStrength } from "@/lib/user-utils";

describe("User Utils", () => {
  describe("Password Hashing", () => {
    it("should hash a password", async () => {
      const password = "SecurePassword123!";
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it("should verify a correct password", async () => {
      const password = "SecurePassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "SecurePassword123!";
      const wrongPassword = "WrongPassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe("Password Validation", () => {
    it("should accept a valid password", () => {
      const result = validatePassword("SecurePassword123!");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject a password without uppercase", () => {
      const result = validatePassword("securepassword123!");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain uppercase letter");
    });

    it("should reject a password without numbers", () => {
      const result = validatePassword("SecurePassword!");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain number");
    });

    it("should reject a password without special characters", () => {
      const result = validatePassword("SecurePassword123");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain special character");
    });
  });

  describe("Password Strength", () => {
    it("should rate a weak password", () => {
      const result = calculatePasswordStrength("weak");
      expect(result.strength).toBe("weak");
      expect(result.percentage).toBeLessThan(40);
    });

    it("should rate a fair password", () => {
      const result = calculatePasswordStrength("FairPass123");
      expect(result.strength).toBe("fair");
      expect(result.percentage).toBeGreaterThanOrEqual(40);
      expect(result.percentage).toBeLessThan(60);
    });

    it("should rate a strong password", () => {
      const result = calculatePasswordStrength("SecurePassword123!");
      expect(result.strength).toBe("strong");
      expect(result.percentage).toBeGreaterThan(80);
    });
  });
});
