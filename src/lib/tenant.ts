import type { UserRole } from "@/lib/types";

export type { UserRole };

export interface TenantContext {
  organizationId: string;
  tenantId: string;
  role: UserRole;
}

export function getTenantRoot(
  organizationId: string
) {
  return `organizations/${organizationId}`;
}

export function getProductsPath(
  organizationId: string
) {
  return `${getTenantRoot(organizationId)}/produtos`;
}

export function getSalesPath(
  organizationId: string
) {
  return `${getTenantRoot(organizationId)}/vendas`;
}