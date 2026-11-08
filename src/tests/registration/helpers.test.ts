import { describe, expect, it } from "vitest";
import { normalizeIndianPhone } from "@/lib/registration/helpers";

describe("registration helpers", () => {
  it("normalizes Indian mobile numbers to +91 E.164 format", () => {
    expect(normalizeIndianPhone("9876543210")).toBe("+919876543210");
    expect(normalizeIndianPhone("+91 98765 43210")).toBe("+919876543210");
    expect(normalizeIndianPhone("+919876543210")).toBe("+919876543210");
  });

  it("keeps invalid entries in a non-normalized form until validation rejects them", () => {
    expect(normalizeIndianPhone("12345")).toBe("12345");
    expect(normalizeIndianPhone("+1234567890")).toBe("+1234567890");
  });
});
