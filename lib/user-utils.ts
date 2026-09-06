import { hash, verify } from "@node-rs/bcrypt";

const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return verify(password, hash);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("Password must contain special character");

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculatePasswordStrength(password: string): {
  strength: "weak" | "fair" | "good" | "strong";
  percentage: number;
} {
  let score = 0;

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  let strength: "weak" | "fair" | "good" | "strong";
  if (score < 40) strength = "weak";
  else if (score < 60) strength = "fair";
  else if (score < 80) strength = "good";
  else strength = "strong";

  return { strength, percentage: Math.min(score, 100) };
}
