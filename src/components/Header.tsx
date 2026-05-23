"use client";

import { Bell, Menu, Search } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({
  onMenuClick,
}: HeaderProps) {
  const { user } = useAuth();

  const displayName =
    user?.email?.split("@")[0] ?? "Admin";

  const initial =
    displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-zinc-800/80 bg-[#09090b]/95 px-4 py-3 backdrop-blur-md md:px-6">
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition-colors hover:text-white md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="relative mx-auto hidden w-full max-w-md flex-1 lg:flex">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          placeholder="Buscar..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-700"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          type="button"
          aria-label="Notificações"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition-colors hover:text-white"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {initial}
          </div>

          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold capitalize text-white">
              {displayName}
            </span>
            <span className="text-xs text-zinc-500">
              Administrador
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
