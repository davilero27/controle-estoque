"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/Sidebar";

import { Header } from "@/components/Header";

import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({
  children,
}: AppLayoutProps) {
  const router = useRouter();
  const { user, loading, organizationId } = useAuth();
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (!loading && user && !organizationId) {
      router.push("/onboarding/organization");
    }
  }, [user, loading, organizationId, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-400">
        Carregando...
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (!organizationId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-400">
        Preparando organização...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full bg-[#09090b] text-white">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
          {children}
        </section>
      </div>
    </main>
  );
}
