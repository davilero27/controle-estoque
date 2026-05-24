"use client";

import { useMemo } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  BarChart3,
  TrendingUp,
} from "lucide-react";

import { useSales } from "@/hooks/useSales";
import { getSaleProductName, getSaleTotal } from "@/lib/types";

interface ChartData {
  name: string;
  total: number;
}

export function SalesChart() {
  // Reutiliza o hook em vez de abrir listener duplicado
  const { sales, loading } = useSales();

  const data = useMemo<ChartData[]>(() => {
    const grouped: Record<string, number> = {};

    sales
      .filter((s) => s.status !== "cancelada")
      .forEach((sale) => {
        if (sale.items && sale.items.length > 0) {
          sale.items.forEach((item) => {
            grouped[item.productName] =
              (grouped[item.productName] ?? 0) +
              item.subtotal;
          });
        } else {
          const name = getSaleProductName(sale);
          if (name) {
            grouped[name] =
              (grouped[name] ?? 0) + getSaleTotal(sale);
          }
        }
      });

    return Object.entries(grouped)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [sales]);

  const topProduct = data.length > 0 ? data[0] : null;

  const totalRevenue = useMemo(
    () => data.reduce((acc, item) => acc + item.total, 0),
    [data]
  );

  if (loading) {
    return (
      <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-3xl mt-6 h-[400px] animate-pulse" />
    );
  }

  return (
    <div
      id="analytics-chart"
      className="bg-zinc-950/50 border border-zinc-800 backdrop-blur-sm p-6 rounded-3xl mt-6 hover:border-purple-500/20 transition-all duration-300"
    >

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8">

        <div className="flex items-center gap-4">

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-purple-500/20">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-black">
              Analytics de Vendas
            </h2>
            <p className="text-zinc-500 mt-1">
              Faturamento por produto
            </p>
          </div>

        </div>

        <div className="flex flex-wrap gap-4">

          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4">
            <p className="text-green-400 text-sm">Faturamento Total</p>
            <strong className="text-2xl font-black">
              R$ {totalRevenue.toFixed(2)}
            </strong>
          </div>

          {topProduct && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl px-5 py-4">
              <p className="text-purple-400 text-sm">Produto Líder</p>
              <strong className="text-lg font-black">
                {topProduct.name}
              </strong>
            </div>
          )}

        </div>

      </div>

      {data.length === 0 ? (

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
          <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">
            Nenhuma venda registrada
          </h3>
          <p className="text-zinc-500">
            O gráfico aparecerá após registrar vendas.
          </p>
        </div>

      ) : (

        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px] h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="name"
                  stroke="#a1a1aa"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#a1a1aa"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="total" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      )}

    </div>
  );
}