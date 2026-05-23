"use client";

import { AppLayout } from "@/components/AppLayout";

import { SalesChart } from "@/components/SalesChart";

import { GenerateSalesPDF } from "@/components/GenerateSalesPDF";

import { SectionTitle } from "@/components/ui/SectionTitle";

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <SectionTitle
          title="Analytics"
          description="Relatórios e análise de vendas"
        />

        <SalesChart />

        <GenerateSalesPDF />
      </div>
    </AppLayout>
  );
}
