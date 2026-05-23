"use client";

import { AppLayout } from "@/components/AppLayout";

import { SalesList } from "@/components/SalesList";

import { SectionTitle } from "@/components/ui/SectionTitle";

export default function HistoricoPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <SectionTitle
          title="Histórico"
          description="Visualize todas as vendas realizadas"
        />

        <SalesList />
      </div>
    </AppLayout>
  );
}
