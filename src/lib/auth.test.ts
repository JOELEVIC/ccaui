/**
 * Simple unit test for auth role helpers.
 * Run with: npx vitest run src/lib/auth.test.ts
 * (Add vitest if not present: npm i -D vitest)
 */

import { describe, it, expect } from "vitest";

const ADMIN_ROLES = ["SCHOOL_ADMIN", "REGIONAL_ADMIN", "NATIONAL_ADMIN"];
const SCHOOL_MANAGER_ROLES = ["SCHOOL_ADMIN", "REGIONAL_ADMIN", "NATIONAL_ADMIN"];
const TOURNAMENT_MANAGER_ROLES = ["COACH", "SCHOOL_ADMIN", "REGIONAL_ADMIN", "NATIONAL_ADMIN"];

function isAdmin(role: string) {
  return ADMIN_ROLES.includes(role);
}
function canManageSchools(role: string) {
  return SCHOOL_MANAGER_ROLES.includes(role);
}
function canManageTournaments(role: string) {
  return TOURNAMENT_MANAGER_ROLES.includes(role);
}

describe("Auth role helpers", () => {
  it("NATIONAL_ADMIN has all permissions", () => {
    expect(isAdmin("NATIONAL_ADMIN")).toBe(true);
    expect(canManageSchools("NATIONAL_ADMIN")).toBe(true);
    expect(canManageTournaments("NATIONAL_ADMIN")).toBe(true);
  });

  it("STUDENT is not admin and cannot manage schools", () => {
    expect(isAdmin("STUDENT")).toBe(false);
    expect(canManageSchools("STUDENT")).toBe(false);
    expect(canManageTournaments("STUDENT")).toBe(false);
  });

  it("COACH can manage tournaments but not schools", () => {
    expect(isAdmin("COACH")).toBe(false);
    expect(canManageSchools("COACH")).toBe(false);
    expect(canManageTournaments("COACH")).toBe(true);
  });
});
