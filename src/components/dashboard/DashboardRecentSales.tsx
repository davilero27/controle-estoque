"use client";

import Link from "next/link";

import type { Sale } from "@/hooks/useSales";
import {
  getSaleProductName,
  getSaleQuantity,
  getSaleTotal,
} from "@/lib/types";

import { formatCurrency } from "@/utils/formatCurrency";

import { formatDate } from "@/utils/formatDate";

import { Card } from "@/components/ui/Card";

interface DashboardRecentSalesProps {
  sales: Sale[];
}

export function DashboardRecentSales({
  sales,
}: DashboardRecentSalesProps) {
  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-white">
        Vendas Recentes
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="pb-3 font-medium">Produto</th>
              <th className="pb-3 font-medium">Qtd</th>
              <th className="pb-3 font-medium">Total</th>
              <th className="pb-3 font-medium">Data</th>
            </tr>
          </thead>

          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-zinc-500"
                >
                  Nenhuma venda registrada
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b border-zinc-800/60 last:border-0"
                >
                  <td className="py-3 font-medium text-white">
                    {getSaleProductName(sale)}
                  </td>

                  <td className="py-3 text-zinc-300">
                    {getSaleQuantity(sale)}
                  </td>

                  <td className="py-3 text-zinc-300">
                    {formatCurrency(getSaleTotal(sale))}
                  </td>

                  <td className="py-3 text-zinc-500">
                    {sale.date
                      ? formatDate(sale.date)
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Link
        href="/historico"
        className="mt-4 block text-center text-sm text-blue-400 transition-colors hover:text-blue-300"
      >
        Ver todas as vendas
      </Link>
    </Card>
  );
}