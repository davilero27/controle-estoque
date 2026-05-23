"use client";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  History,
  Box,
  LogOut,
  X,
  Settings,
} from "lucide-react";

import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

import {
  canManageProducts,
  canManageUsers,
  canViewAnalytics,
} from "@/utils/permissions";

interface SidebarProps {
  open?: boolean;

  onClose?: () => void;
}

export function Sidebar({
  open = false,
  onClose,
}: SidebarProps) {

  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    logout,
    role,
  } = useAuth();

  const menuItems = [
    {
      href: "/dashboard",

      label: "Dashboard",

      icon:
        LayoutDashboard,

      visible: true,
    },

    {
      href: "/produtos",

      label: "Produtos",

      icon: Package,

      visible:
        canManageProducts(
          role
        ),
    },

    {
      href: "/vendas",

      label: "Vendas",

      icon:
        ShoppingCart,

      visible: true,
    },

    {
      href: "/historico",

      label: "Histórico",

      icon: History,

      visible: true,
    },

    {
      href: "/analytics",

      label: "Analytics",

      icon:
        BarChart3,

      visible:
        canViewAnalytics(
          role
        ),
    },

    {
      href: "/organizacao",

      label: "Organização",

      icon: Settings,

      visible:
        canManageUsers(
          role
        ),
    },
  ];

  async function handleLogout() {

    try {

      await logout();

      toast.success(
        "Sessão encerrada com sucesso"
      );

      router.push(
        "/login"
      );

    } catch {

      toast.error(
        "Erro ao sair da conta"
      );
    }
  }

  const content = (
    <>
      {/* Logo */}
      <div className="flex flex-1 flex-col p-5">

        <div className="mb-8 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">

            <Box className="h-5 w-5 text-white" />

          </div>

          <div>

            <h1 className="text-lg font-bold text-white">
              StockPro
            </h1>

            <p className="text-xs text-zinc-500">
              Sistema de Estoque
            </p>

          </div>

        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1">

          {menuItems
            .filter(
              (item) =>
                item.visible
            )
            .map((item) => {

              const Icon =
                item.icon;

              const isActive =
                pathname ===
                  item.href ||
                (item.href ===
                  "/dashboard" &&
                  pathname ===
                    "/");

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  onClick={
                    onClose
                  }
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
                  }`}
                >

                  <Icon className="h-5 w-5 shrink-0" />

                  <span>
                    {
                      item.label
                    }
                  </span>

                </Link>
              );
            })}
        </nav>

      </div>

      {/* Logout */}
      <div className="border-t border-zinc-800/80 p-5">

        <button
          type="button"
          onClick={
            handleLogout
          }
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-800/60 hover:text-white"
        >

          <LogOut className="h-5 w-5" />

          Sair

        </button>

      </div>
    </>
  );

  return (
    <>
      {/* Overlay Mobile */}
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={
            onClose
          }
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-zinc-800/80 bg-[#0c0c0e] md:flex">

        {content}

      </aside>

      {/* Sidebar Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(82vw,20rem)] shrink-0 flex-col border-r border-zinc-800/80 bg-[#0c0c0e] transition-transform duration-300 md:hidden ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Botão fechar */}
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={
            onClose
          }
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:text-white"
        >

          <X className="h-4 w-4" />

        </button>

        {content}

      </aside>
    </>
  );
}