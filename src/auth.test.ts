import { describe, it, expect, beforeAll } from "vitest";
import type { Request } from "express";
import {
  getBearerToken,
  makeJWT,
  makeRefreshToken,
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

describe("makeRefreshToken", () => {
  const HEX_REGEX = /^[0-9a-f]+$/;

  it("returns a 64-character hex string (256 bits)", () => {
    const token = makeRefreshToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(HEX_REGEX);
  });

  it("returns unique tokens on each call", () => {
    const a = makeRefreshToken();
    const b = makeRefreshToken();
    expect(a).not.toBe(b);
  });
});

describe("getBearerToken", () => {
  it("returns the token when Authorization header has Bearer prefix", () => {
    const req = {
      get: (name: string) =>
        name === "Authorization" ? "Bearer my-token-123" : undefined,
    } as Request;
    expect(getBearerToken(req)).toBe("my-token-123");
  });

  it("strips whitespace from token", () => {
    const req = {
      get: (name: string) =>
        name === "Authorization" ? "Bearer   token-with-spaces  " : undefined,
    } as Request;
    expect(getBearerToken(req)).toBe("token-with-spaces");
  });

  it("throws when Authorization header is missing", () => {
    const req = { get: (_: string) => undefined } as Request;
    expect(() => getBearerToken(req)).toThrow(
      "Authorization header is required",
    );
  });

  it("throws when header does not start with Bearer", () => {
    const req = {
      get: (name: string) =>
        name === "Authorization" ? "Basic xxx" : undefined,
    } as Request;
    expect(() => getBearerToken(req)).toThrow(
      "Authorization header must be Bearer token",
    );
  });

  it("throws when token is empty after Bearer prefix", () => {
    const req = {
      get: (name: string) =>
        name === "Authorization" ? "Bearer  " : undefined,
    } as Request;
    expect(() => getBearerToken(req)).toThrow("Authorization token is empty");
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
