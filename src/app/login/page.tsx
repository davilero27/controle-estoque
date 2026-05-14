"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";



export default function LoginPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Preencha todos os campos");

      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      router.push("/");
    } catch (error) {
      console.log(error);

      alert("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Login
        </h1>

        <p className="text-zinc-400 mb-6">
          Entre para acessar o sistema
        </p>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="bg-zinc-800 text-white p-3 rounded-lg outline-none"
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="bg-zinc-800 text-white p-3 rounded-lg outline-none"
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
          >
            {loading
              ? "Entrando..."
              : "Entrar"}
          </button>
        </div>
      </div>
    </main>
  );
}