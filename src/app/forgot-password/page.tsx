"use client";

import Link from "next/link";
import { useState } from "react";

import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth } from "@/lib/firebase";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendResetEmail() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.info("Informe seu email para continuar");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Digite um email válido");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, normalizedEmail);

      toast.success(
        "Enviamos um link de recuperação para seu email"
      );
      setEmail("");
    } catch (error) {
      console.log(error);

      toast.error(
        "Não foi possível enviar o link. Confira o email e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white sm:p-6">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="mb-7">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Mail className="h-5 w-5" />
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Recuperar senha
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Informe seu email e enviaremos um link seguro para redefinir sua senha.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Email
            </label>

            <Input
              id="email"
              type="email"
              placeholder="voce@empresa.com"
              value={email}
              disabled={loading}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSendResetEmail();
                }
              }}
              className="bg-zinc-950 text-white placeholder:text-zinc-600"
            />
          </div>

          <Button
            type="button"
            onClick={handleSendResetEmail}
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Enviando link..."
              : "Enviar link de recuperação"}
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>
        </div>
      </section>
    </main>
  );
}
