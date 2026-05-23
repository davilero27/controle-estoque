"use client";

import Link from "next/link";

import { Package } from "lucide-react";

import type { Product } from "@/lib/types";

import { Card } from "@/components/ui/Card";

interface DashboardLowStockProps {
  products: Product[];
}

export function DashboardLowStock({
  products,
}: DashboardLowStockProps) {
  const items = products.slice(0, 4);

  return (
    <Card className="flex h-full flex-col">
      <h2 className="mb-4 text-base font-semibold text-white">
        Estoque Baixo
      </h2>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Nenhum produto com estoque baixo
        </p>
      ) : (
        <ul className="flex flex-1 flex-col gap-3">
          {items.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                  <Package className="h-5 w-5 text-zinc-500" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {product.nome}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {product.estoque} un.
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-md bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-400">
                Baixo
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/produtos"
        className="mt-4 text-center text-sm text-blue-400 transition-colors hover:text-blue-300"
      >
        Ver todos
      </Link>
    </Card>
  );
}
