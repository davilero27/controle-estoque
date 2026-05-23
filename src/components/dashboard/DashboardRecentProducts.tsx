"use client";

import Link from "next/link";

import { Package, Pencil, Trash2 } from "lucide-react";

import { deleteProduct } from "@/services/products";

import type { Product } from "@/lib/types";

import { useAuth } from "@/contexts/AuthContext";

import { formatCurrency } from "@/utils/formatCurrency";

import { Card } from "@/components/ui/Card";

import { toast } from "sonner";

interface DashboardRecentProductsProps {
  products: Product[];
}

export function DashboardRecentProducts({
  products,
}: DashboardRecentProductsProps) {
  const { organizationId, role } = useAuth();

  async function handleDelete(id: string) {
    if (!organizationId || role !== "admin") {
      toast.error("Você não tem permissão para excluir produtos");
      return;
    }

    try {
      await deleteProduct(organizationId, id);
      toast.success("Produto excluído");
    } catch (error) {
      console.log(error);
      toast.error("Erro ao excluir produto");
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-white">
        Produtos Recentes
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="pb-3 font-medium">Produto</th>
              <th className="pb-3 font-medium">Preço</th>
              <th className="pb-3 font-medium">Estoque</th>
              <th className="pb-3 text-right font-medium">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-zinc-500"
                >
                  Nenhum produto cadastrado
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-zinc-800/60 last:border-0"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                        <Package className="h-4 w-4 text-zinc-500" />
                      </div>
                      <span className="font-medium text-white">
                        {product.nome}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 text-zinc-300">
                    {formatCurrency(product.preco)}
                  </td>

                  <td
                    className={`py-3 font-medium ${
                      product.estoque <= 5
                        ? "text-red-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {product.estoque}
                  </td>

                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href="/produtos"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 transition-colors hover:text-white"
                        aria-label="Editar produto"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(product.id)
                        }
                        disabled={role !== "admin"}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                        aria-label="Excluir produto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Link
        href="/produtos"
        className="mt-4 block text-center text-sm text-blue-400 transition-colors hover:text-blue-300"
      >
        Ver todos os produtos
      </Link>
    </Card>
  );
}
