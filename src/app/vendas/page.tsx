"use client";

import { AppLayout } from "@/components/AppLayout";

import { SalesForm } from "@/components/SalesForm";

import { SectionTitle } from "@/components/ui/SectionTitle";

export default function VendasPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <SectionTitle
          title="Vendas"
          description="Registre vendas e atualize o estoque"
        />

        <SalesForm />
      </div>
    </AppLayout>
  );
}
