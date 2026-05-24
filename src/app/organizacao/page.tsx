"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
  MailPlus,
  Save,
} from "lucide-react";

import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";

import { Button } from "@/components/ui/Button";

import { Card } from "@/components/ui/Card";

import { Input } from "@/components/ui/Input";

import { SectionTitle } from "@/components/ui/SectionTitle";

import { RoleGuard } from "../../components/RoleGuard";

import { useAuth } from "@/contexts/AuthContext";

import type {
  OrganizationInvite,
  UserRole,
} from "@/lib/types";

import {
  createOrganizationInvite,
  getOrganization,
  listOrganizationInvites,
  updateOrganizationName,
} from "@/services/organizations";

// migrateLegacyData foi removido desta UI — usar script administrativo separado

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function OrganizationSettingsPage() {

  const {
    organizationId,
    role,
  } = useAuth();

  const [organizationName, setOrganizationName] =
    useState("");

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [inviteRole, setInviteRole] =
    useState<UserRole>("employee");

  const [invites, setInvites] =
    useState<OrganizationInvite[]>([]);

  const [saving, setSaving] = useState(false);

  const [inviting, setInviting] = useState(false);

  useEffect(() => {

    if (!organizationId) {
      return;
    }

    async function loadOrganization() {

      try {

        const [
          organization,
          organizationInvites,
        ] = await Promise.all([
          getOrganization(organizationId!),
          listOrganizationInvites(organizationId!),
        ]);

        setOrganizationName(organization?.name ?? "");
        setInvites(organizationInvites);

      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar organização");
      }
    }

    loadOrganization();

  }, [organizationId]);

  async function handleSaveOrganization() {

    if (!organizationId) return;

    if (role !== "owner") {
      toast.error("Apenas o owner pode editar a organização");
      return;
    }

    if (organizationName.trim().length < 2) {
      toast.error("Informe um nome válido");
      return;
    }

    try {
      setSaving(true);
      await updateOrganizationName(
        organizationId,
        organizationName.trim()
      );
      toast.success("Organização atualizada");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar organização");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateInvite() {

    if (!organizationId) return;

    if (role !== "owner") {
      toast.error("Apenas o owner pode convidar usuários");
      return;
    }

    const normalizedEmail = inviteEmail.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Informe um email válido");
      return;
    }

    try {
      setInviting(true);

      await createOrganizationInvite({
        organizationId,
        email: normalizedEmail,
        role: inviteRole,
      });

      const nextInvites =
        await listOrganizationInvites(organizationId);

      setInvites(nextInvites);
      setInviteEmail("");
      setInviteRole("employee");

      toast.success("Convite registrado com sucesso");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar convite");
    } finally {
      setInviting(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["owner"]}>

      <AppLayout>

        <div className="space-y-6">

          <SectionTitle
            title="Organização"
            description="Gerencie empresa e convites"
          />

          <div className="grid gap-6 xl:grid-cols-2">

            {/* Empresa */}
            <Card>

              <div className="mb-5 flex items-center gap-3">

                <div className="rounded-xl bg-blue-600 p-3">
                  <Building2 className="h-5 w-5 text-white" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Dados da empresa
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Nome exibido no sistema
                  </p>
                </div>

              </div>

              <div className="space-y-4">

                <Input
                  value={organizationName}
                  disabled={saving}
                  placeholder="Nome da organização"
                  onChange={(event) =>
                    setOrganizationName(event.target.value)
                  }
                />

                <Button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveOrganization}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar alterações"}
                </Button>

              </div>

            </Card>

            {/* Convites */}
            <Card>

              <div className="mb-5 flex items-center gap-3">

                <div className="rounded-xl bg-emerald-600 p-3">
                  <MailPlus className="h-5 w-5 text-white" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Convites
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Convide usuários para a organização
                  </p>
                </div>

              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_160px]">

                <Input
                  type="email"
                  value={inviteEmail}
                  disabled={inviting}
                  placeholder="usuario@empresa.com"
                  onChange={(event) =>
                    setInviteEmail(event.target.value)
                  }
                />

                <select
                  value={inviteRole}
                  disabled={inviting}
                  onChange={(event) =>
                    setInviteRole(event.target.value as UserRole)
                  }
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                >
                  <option value="employee">Funcionário</option>
                  <option value="admin">Admin</option>
                </select>

              </div>

              <Button
                type="button"
                disabled={inviting}
                onClick={handleCreateInvite}
                className="mt-3 w-full"
              >
                {inviting ? "Registrando..." : "Registrar convite"}
              </Button>

              <div className="mt-5 space-y-2">

                {invites.length === 0 ? (

                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                    Nenhum convite registrado.
                  </p>

                ) : (

                  invites.map((invite) => (

                    <div
                      key={invite.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm"
                    >

                      <div>
                        <p className="font-medium text-white">
                          {invite.email}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {invite.role} · {invite.status}
                        </p>
                      </div>

                    </div>
                  ))
                )}

              </div>

            </Card>

          </div>

        </div>

      </AppLayout>

    </RoleGuard>
  );
}