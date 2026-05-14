"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const router = useRouter();

  const { user, logout } = useAuth();

  // Faz o logout e redireciona para a tela de login em seguida
  async function handleLogout() {
    await logout();

    router.push("/login");
  }

  return (
    <header className="w-full bg-zinc-900 border-b border-zinc-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Controle de Estoque
        </h1>

        <p className="text-zinc-400">
          Gerencie seus produtos
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-zinc-500">
            Usuário logado
          </p>

          {/* Exibe o e-mail do usuário autenticado; o ?. evita erro se o usuário ainda for null */}
          <strong className="text-white">
            {user?.email}
          </strong>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg text-white"
        >
          Sair
        </button>
      </div>
    </header>
  );
}