// Property 5: Sign-up validation. Validates Requirements 1.2, 1.5, 1.7, 1.8.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  isValidEmailFormat,
  validateSignUp,
} from "./validation";

describe("Property 5: sign-up validation", () => {
  it("succeeds iff email valid, password >= 8, display name length 1..50", () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 40 }),
        fc.string({ maxLength: 20 }),
        fc.string({ maxLength: 60 }),
        (email, password, displayName) => {
          const result = validateSignUp({ email, password, displayName });

          const trimmedName = displayName.trim();
          const expectOk =
            isValidEmailFormat(email.trim()) &&
            email.trim().length > 0 &&
            password.length >= PASSWORD_MIN_LENGTH &&
            trimmedName.length >= 1 &&
            trimmedName.length <= DISPLAY_NAME_MAX_LENGTH;

          expect(result.ok).toBe(expectOk);
          if (!result.ok) {
            // Always identifies a specific offending field.
            expect(["email", "password", "displayName"]).toContain(result.error.field);
          }
        },
      ),
      { numRuns: 300 },
    );
  });

  it("accepts a known-good input", () => {
    expect(validateSignUp({
      email: "user@example.com",
      password: "password1",
      displayName: "Grass Toucher",
    })).toEqual({ ok: true });
  });

  it("flags each field deterministically", () => {
    expect(validateSignUp({ email: "", password: "password1", displayName: "A" }))
      .toMatchObject({ ok: false, error: { field: "email", reason: "missing" } });
    expect(validateSignUp({ email: "nope", password: "password1", displayName: "A" }))
      .toMatchObject({ ok: false, error: { field: "email", reason: "invalidFormat" } });
    expect(validateSignUp({ email: "a@b.co", password: "short", displayName: "A" }))
      .toMatchObject({ ok: false, error: { field: "password", reason: "tooShort" } });
    expect(validateSignUp({ email: "a@b.co", password: "password1", displayName: "x".repeat(51) }))
      .toMatchObject({ ok: false, error: { field: "displayName", reason: "tooLong" } });
  });
});
