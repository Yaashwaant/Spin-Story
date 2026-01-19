import { hashPassword, verifyPassword, generateToken, verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should hash password with bcrypt", async () => {
      const password = "testPassword123!";
      const hashedPassword = "hashedPassword123";
      
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      
      const result = await hashPassword(password);
      
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });
  });

  describe("verifyPassword", () => {
    it("should verify password correctly", async () => {
      const password = "testPassword123!";
      const hashedPassword = "hashedPassword123";
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await verifyPassword(password, hashedPassword);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "wrongPassword";
      const hashedPassword = "hashedPassword123";
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      const result = await verifyPassword(password, hashedPassword);
      
      expect(result).toBe(false);
    });
  });

  describe("generateToken", () => {
    it("should generate JWT token", () => {
      const user = {
        id: "user123",
        email: "test@example.com",
        fullName: "Test User",
        role: "USER",
        onboarded: false,
      };
      
      const mockToken = "mock.jwt.token";
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      
      const result = generateToken(user);
      
      expect(jwt.sign).toHaveBeenCalledWith(user, expect.any(String), { expiresIn: "7d" });
      expect(result).toBe(mockToken);
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token", () => {
      const mockToken = "valid.jwt.token";
      const decodedUser = {
        id: "user123",
        email: "test@example.com",
        fullName: "Test User",
        role: "USER",
        onboarded: false,
      };
      
      (jwt.verify as jest.Mock).mockReturnValue(decodedUser);
      
      const result = verifyToken(mockToken);
      
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
      expect(result).toEqual(decodedUser);
    });

    it("should return null for invalid token", () => {
      const invalidToken = "invalid.jwt.token";
      
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });
      
      const result = verifyToken(invalidToken);
      
      expect(result).toBe(null);
    });
  });
});