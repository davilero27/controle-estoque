"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { createOrganizationForUser } from "@/services/organizations";

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateOrganization() {
    const organizationName = name.trim();

    if (!user) {
      toast.error("Faça login para criar a organização");
      router.push("/login");
      return;
    }

    if (organizationName.length < 2) {
      toast.error("Informe um nome válido para a empresa");
      return;
    }

    try {
      setLoading(true);

      await createOrganizationForUser({
        uid: user.uid,
        email: user.email ?? "",
        name: organizationName,
      });

      await refreshProfile();

      toast.success("Organização criada com sucesso");
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar organização");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white sm:p-6">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="mb-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Building2 className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Configure sua empresa
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Crie a organização que vai isolar produtos, vendas, usuários e relatórios do seu negócio.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Nome da empresa
            </label>

            <Input
              value={name}
              disabled={loading}
              placeholder="Ex: Minha Loja"
              onChange={(event) =>
                setName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleCreateOrganization();
                }
              }}
              className="bg-zinc-950 text-white placeholder:text-zinc-600"
            />
          </div>

          <Button
            type="button"
            onClick={handleCreateOrganization}
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Criando organização..."
              : "Criar organização"}
          </Button>
        </div>
      </section>
    </main>
  );
}
