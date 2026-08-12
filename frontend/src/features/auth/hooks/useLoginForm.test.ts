import { describe, expect, it } from "vitest";

import { resolvePostLoginRedirect } from "./useLoginForm";

describe("resolvePostLoginRedirect", () => {
  it("keeps the original path for a regular tourist when it is not protected admin", () => {
    expect(resolvePostLoginRedirect("/profile", "tourist")).toBe("/profile");
  });

  it("redirects a tourist away from admin routes after login", () => {
    expect(resolvePostLoginRedirect("/admin/dashboard", "tourist")).toBe("/");
  });

  it("redirects admin users to the admin dashboard", () => {
    expect(resolvePostLoginRedirect("/login", "admin")).toBe("/admin/dashboard");
  });
});
