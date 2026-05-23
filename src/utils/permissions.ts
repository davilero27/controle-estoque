import { UserRole } from "@/lib/types";

export function isOwner(
  role?: UserRole
) {
  return role === "owner";
}

export function isAdmin(
  role?: UserRole
) {
  return (
    role === "owner" ||
    role === "admin"
  );
}

export function canManageProducts(
  role?: UserRole
) {
  return (
    role === "owner" ||
    role === "admin"
  );
}

export function canManageUsers(
  role?: UserRole
) {
  return role === "owner";
}

export function canViewAnalytics(
  role?: UserRole
) {
  return (
    role === "owner" ||
    role === "admin"
  );
}