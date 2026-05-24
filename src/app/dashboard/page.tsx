"use client";

import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";

import { useProducts } from "@/hooks/useProducts";

import { useSales } from "@/hooks/useSales";

import { formatCurrency } from "@/utils/formatCurrency";

import { SectionTitle } from "@/components/ui/SectionTitle";

import { StatCard } from "@/components/ui/StatCard";

import { Skeleton } from "@/components/ui/Skeleton";

import { DashboardSalesChart } from "@/components/dashboard/DashboardSalesChart";

import { DashboardLowStock } from "@/components/dashboard/DashboardLowStock";

import { DashboardRecentProducts } from "@/components/dashboard/DashboardRecentProducts";

import { DashboardRecentSales } from "@/components/dashboard/DashboardRecentSales";

export default function DashboardPage() {

  const {
    loading: loadingProducts,
    totalProducts,
    lowStockProducts,
    lowStockItems,
    recentProducts,
  } = useProducts();

  const {
    loading: loadingSales,
    salesTodayCount,
    revenueToday,
    salesDiff,
    revenueDiff,
    last7DaysChart,
    recentSales,
  } = useSales();

  // Loading real — aguarda os dois hooks
  const isLoading = loadingProducts || loadingSales;

  // Tendências
  const salesTrend =
    salesDiff >= 0
      ? `+${salesDiff} desde ontem`
      : `${salesDiff} desde ontem`;

  const revenueTrend =
    revenueDiff >= 0
      ? `+${revenueDiff}% desde ontem`
      : `${revenueDiff}% desde ontem`;

  return (
    <AppLayout>

      <div className="space-y-6">

        {/* Header */}
        <SectionTitle
          title="Dashboard"
          description="Visão geral do sistema"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {isLoading ? (

            Array.from({
              length: 4,
            }).map((_, index) => (

              <Skeleton
                key={index}
                className="h-36 rounded-2xl"
              />

            ))

          ) : (

            <>

              {/* Produtos */}
              <StatCard
                title="Total de Produtos"
                value={String(totalProducts)}
                trend={`${totalProducts} no catálogo`}
                icon={Package}
                iconClassName="bg-blue-600/90"
              />

              {/* Vendas */}
              <StatCard
                title="Vendas Hoje"
                value={String(salesTodayCount)}
                trend={salesTrend}
                icon={ShoppingCart}
                iconClassName="bg-emerald-600/90"
              />

              {/* Receita */}
              <StatCard
                title="Faturamento Hoje"
                value={formatCurrency(revenueToday)}
                trend={revenueTrend}
                icon={DollarSign}
                iconClassName="bg-violet-600/90"
              />

              {/* Estoque baixo */}
              <StatCard
                title="Estoque Baixo"
                value={`${lowStockProducts} Produtos`}
                trend={
                  lowStockProducts > 0
                    ? "Requer atenção"
                    : "Tudo em ordem"
                }
                icon={AlertTriangle}
                iconClassName="bg-amber-600/90"
              />

            </>

          )}

        </div>

        {/* Charts + Low stock */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

          {isLoading ? (

            <>
              <Skeleton className="h-[350px] rounded-2xl xl:col-span-2" />

              <Skeleton className="h-[350px] rounded-2xl" />
            </>

          ) : (

            <>
              <div className="xl:col-span-2">

                <DashboardSalesChart
                  data={last7DaysChart}
                />

              </div>

              <DashboardLowStock
                products={lowStockItems}
              />
            </>

          )}

        </div>

        {/* Recentes */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

          {isLoading ? (

            <>
              <Skeleton className="h-[300px] rounded-2xl" />

              <Skeleton className="h-[300px] rounded-2xl" />
            </>

          ) : (

            <>
              <DashboardRecentProducts
                products={recentProducts}
              />

              <DashboardRecentSales
                sales={recentSales}
              />
            </>

          )}

        </div>

      </div>

    </AppLayout>
  );
}