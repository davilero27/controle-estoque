"use client";

import "@/lib/firebase";

import { useState } from "react";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProductForm } from "@/components/ProductForm";
import { ProductList } from "@/components/ProductList";

export default function Home() {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  return (

    <main className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <section className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-zinc-900 p-6 rounded-2xl">
              <h3 className="text-zinc-400">
                Produtos
              </h3>

              <p className="text-3xl font-bold mt-2">
                120
              </p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl">
              <h3 className="text-zinc-400">
                Vendas
              </h3>

              <p className="text-3xl font-bold mt-2">
                35
              </p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl">
              <h3 className="text-zinc-400">
                Estoque Baixo
              </h3>

              <p className="text-3xl font-bold mt-2">
                8
              </p>
            </div>
          </div>
          <ProductForm
            editingProduct={editingProduct}
            onFinishEdit={() => {
              setEditingProduct(null);
              setRefreshTrigger((old) => old + 1);  
            }}
            onProductCreated={() => {
              setRefreshTrigger((old) => old + 1);
            }}
          />
          <ProductList
            refreshTrigger={refreshTrigger}
            onEditProduct={(product) => {
              setEditingProduct(product);
            }}
          />
        </section>
      </div>
    </main>
  );
}