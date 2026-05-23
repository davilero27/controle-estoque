"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

import type {
  UserRole,
} from "@/lib/types";

interface RoleGuardProps {
  children: React.ReactNode;

  allowedRoles: UserRole[];
}

export function RoleGuard({
  children,
  allowedRoles,
}: RoleGuardProps) {

  const router =
    useRouter();

  const {
    role,
    loading,
  } = useAuth();

  useEffect(() => {

    if (loading) {
      return;
    }

    if (
      !role ||
      !allowedRoles.includes(
        role
      )
    ) {

      toast.error(
        "Acesso negado"
      );

      router.push(
        "/dashboard"
      );
    }

  }, [
    role,
    loading,
    allowedRoles,
    router,
  ]);

  if (
    loading ||
    !role ||
    !allowedRoles.includes(
      role
    )
  ) {
    return null;
  }

  return children;
}