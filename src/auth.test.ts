import { describe, it, expect, beforeAll } from "vitest";
import {
  makeJWT,
  validateJWT,
  hashPassword,
  checkPasswordHash,
} from "./auth.js";

const SECRET = "test-secret-key";
const USER_ID = "user-123";

describe("makeJWT and validateJWT", () => {
  it("should create and validate a JWT, returning the same user ID", () => {
    const token = makeJWT(USER_ID, 3600, SECRET);
    const decodedId = validateJWT(token, SECRET);
    expect(decodedId).toBe(USER_ID);
  });

  it("should reject JWTs signed with the wrong secret", () => {
    const token = makeJWT(USER_ID, 3600, SECRET);
    expect(() => validateJWT(token, "wrong-secret")).toThrow();
  });

  it("should reject expired tokens", () => {
    const token = makeJWT(USER_ID, -1, SECRET);
    expect(() => validateJWT(token, SECRET)).toThrow();
  });
});

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for the wrong password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });
});
