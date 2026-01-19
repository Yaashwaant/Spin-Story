import { signUpSchema, signInSchema, forgotPasswordSchema, resetPasswordSchema } from "@/models/auth";

describe("Auth Validation Schemas", () => {
  describe("signUpSchema", () => {
    it("should validate correct sign up data", () => {
      const validData = {
        fullName: "John Doe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "Password123!",
        confirmPassword: "Password123!",
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        fullName: "John Doe",
        email: "invalid-email",
        phoneNumber: "+1234567890",
        password: "Password123!",
        confirmPassword: "Password123!",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Please enter a valid email address");
    });

    it("should reject weak password", () => {
      const invalidData = {
        fullName: "John Doe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "weak",
        confirmPassword: "weak",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain("at least 8 characters");
    });

    it("should reject mismatched passwords", () => {
      const invalidData = {
        fullName: "John Doe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "Password123!",
        confirmPassword: "Different123!",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Passwords don't match");
    });
  });

  describe("signInSchema", () => {
    it("should validate correct sign in data", () => {
      const validData = {
        emailOrPhone: "john@example.com",
        password: "Password123!",
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty fields", () => {
      const invalidData = {
        emailOrPhone: "",
        password: "",
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should validate correct email", () => {
      const validData = {
        email: "john@example.com",
      };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
      };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate correct password reset data", () => {
      const validData = {
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const invalidData = {
        password: "NewPassword123!",
        confirmPassword: "Different123!",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Passwords don't match");
    });
  });
});