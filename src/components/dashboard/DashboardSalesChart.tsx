"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { Card } from "@/components/ui/Card";

interface DashboardSalesChartProps {
  data: { name: string; total: number }[];
}

export function DashboardSalesChart({
  data,
}: DashboardSalesChartProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Vendas — Últimos 7 dias
        </h2>

        <select
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 outline-none"
          defaultValue="7"
          aria-label="Período do gráfico"
        >
          <option value="7">7 dias</option>
        </select>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              stroke="#71717a"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <YAxis
              stroke="#71717a"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value) => [
                `R$ ${Number(value).toFixed(2)}`,
                "Vendas",
              ]}
            />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "#3b82f6",
                strokeWidth: 0,
              }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
