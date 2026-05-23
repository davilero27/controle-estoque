"use client";

import Link from "next/link";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      toast.info("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      toast.error("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white sm:p-6">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Login
        </h1>

        <p className="mb-6 text-zinc-400">
          Entre para acessar o sistema
        </p>

        <div className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            disabled={loading}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="bg-zinc-950 text-white placeholder:text-zinc-600"
          />

          <Input
            type="password"
            placeholder="Sua senha"
            value={password}
            disabled={loading}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleLogin();
              }
            }}
            className="bg-zinc-950 text-white placeholder:text-zinc-600"
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </section>
    </main>
  );
}
