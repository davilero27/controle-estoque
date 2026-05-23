"use client";

import { useState } from "react";

import type { Product } from "@/lib/types";

import { AppLayout } from "@/components/AppLayout";

import { ProductForm } from "@/components/ProductForm";

import { ProductList } from "@/components/ProductList";

import { SectionTitle } from "@/components/ui/SectionTitle";

export default function ProdutosPage() {
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [refresh, setRefresh] = useState(0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <SectionTitle
          title="Produtos"
          description="Gerencie os produtos da loja"
        />

        <ProductForm
          key={editingProduct?.id ?? "new-product"}
          editingProduct={editingProduct}
          onFinishEdit={() => {
            setEditingProduct(null);
            setRefresh((old) => old + 1);
          }}
          onProductCreated={() => {
            setRefresh((old) => old + 1);
          }}
        />

        <ProductList
          refreshTrigger={refresh}
          onEditProduct={(product) => {
            setEditingProduct(product);
          }}
        />
      </div>
    </AppLayout>
  );
}
