"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import "@/lib/firebase";

import { db } from "@/lib/firestore";

import { useAuth } from "@/contexts/AuthContext";

import type { Product } from "@/lib/types";

import { Header } from "@/components/Header";

import { Sidebar } from "@/components/Sidebar";

import { ProductForm } from "@/components/ProductForm";

import { ProductList } from "@/components/ProductList";

import { SalesForm } from "@/components/SalesForm";

import { SalesList } from "@/components/SalesList";

import { SalesChart } from "@/components/SalesChart";

import { GenerateSalesPDF } from "@/components/GenerateSalesPDF";

export default function Home() {
  const router = useRouter();

  const { user, loading } =
    useAuth();

  // Produto em edição
  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(
    null
  );

  // Atualização da lista
  const [refresh, setRefresh] =
    useState(0);

  // Dashboard
  const [
    totalProducts,
    setTotalProducts,
  ] = useState(0);

  const [
    totalStockValue,
    setTotalStockValue,
  ] = useState(0);

  const [
    lowStockProducts,
    setLowStockProducts,
  ] = useState(0);

  const [
    totalRevenue,
    setTotalRevenue,
  ] = useState(0);

  const [
    topProduct,
    setTopProduct,
  ] = useState("");

  // Verifica autenticação
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Escuta produtos
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "produtos"),
      (snapshot) => {
        const products =
          snapshot.docs.map(
            (doc) => {
              const data =
                doc.data();

              return {
                preco: Number(
                  data.preco || 0
                ),

                estoque: Number(
                  data.estoque || 0
                ),
              };
            }
          );

        // Total produtos
        setTotalProducts(
          products.length
        );

        // Valor total estoque
        const totalValue =
          products.reduce(
            (acc, product) => {
              return (
                acc +
                product.preco *
                product.estoque
              );
            },
            0
          );

        setTotalStockValue(
          totalValue
        );

        // Estoque baixo
        const lowStock =
          products.filter(
            (product) =>
              product.estoque <= 5
          );

        setLowStockProducts(
          lowStock.length
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // Escuta vendas
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "vendas"),
      (snapshot) => {
        const sales =
          snapshot.docs.map(
            (doc) => {
              const data =
                doc.data();

              return {
                produtoNome:
                  data.produtoNome ||
                  "",

                quantidade: Number(
                  data.quantidade || 0
                ),

                valorTotal: Number(
                  data.valorTotal || 0
                ),
              };
            }
          );

        // Faturamento
        const revenue =
          sales.reduce(
            (acc, sale) => {
              return (
                acc +
                sale.valorTotal
              );
            },
            0
          );

        setTotalRevenue(revenue);

        // Produto mais vendido
        const productsMap:
          Record<
            string,
            number
          > = {};

        sales.forEach((sale) => {
          if (
            productsMap[
            sale.produtoNome
            ]
          ) {
            productsMap[
              sale.produtoNome
            ] += sale.quantidade;
          } else {
            productsMap[
              sale.produtoNome
            ] = sale.quantidade;
          }
        });

        let bestProduct = "";
        let bestQuantity = 0;

        Object.entries(
          productsMap
        ).forEach(
          ([name, quantity]) => {
            if (
              quantity >
              bestQuantity
            ) {
              bestQuantity =
                quantity;

              bestProduct = name;
            }
          }
        );

        setTopProduct(
          bestProduct
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Carregando...
      </main>
    );
  }

  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-white">

      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1">

        {/* Header */}
        <Header />

        <section className="p-6">

          {/* Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">

            {/* Produtos */}
            <div className="bg-zinc-900 p-6 rounded-2xl">
              <h2 className="text-zinc-400">
                Produtos
              </h2>

              <strong className="text-3xl">
                {totalProducts}
              </strong>
            </div>

            {/* Valor Estoque */}
            <div className="bg-zinc-900 p-6 rounded-2xl">
              <h2 className="text-zinc-400">
                Valor em Estoque
              </h2>

              <strong className="text-3xl">
                R${" "}
                {totalStockValue.toFixed(
                  2
                )}
              </strong>
            </div>

            {/* Estoque Baixo */}
            <div className="bg-zinc-900 p-6 rounded-2xl">
              <h2 className="text-zinc-400">
                Estoque Baixo
              </h2>

              <strong className="text-3xl text-red-400">
                {lowStockProducts}
              </strong>
            </div>

            {/* Faturamento */}
            <div className="bg-zinc-900 p-6 rounded-2xl">
              <h2 className="text-zinc-400">
                Faturamento
              </h2>

              <strong className="text-3xl text-green-400">
                R${" "}
                {totalRevenue.toFixed(
                  2
                )}
              </strong>
            </div>

            {/* Produto Mais Vendido */}
            <div className="bg-zinc-900 p-6 rounded-2xl">
              <h2 className="text-zinc-400">
                Produto Mais Vendido
              </h2>

              <strong className="text-2xl text-blue-400">
                {topProduct ||
                  "Nenhum"}
              </strong>
            </div>

          </div>

          {/* Formulário Produto */}
          <ProductForm
            editingProduct={
              editingProduct
            }
            onFinishEdit={() => {
              setEditingProduct(
                null
              );

              setRefresh(
                (old) => old + 1
              );
            }}
            onProductCreated={() => {
              setRefresh(
                (old) => old + 1
              );
            }}
          />

          {/* Lista Produtos */}
          <ProductList
            refreshTrigger={
              refresh
            }
            onEditProduct={(
              product
            ) => {
              setEditingProduct(
                product
              );
            }}
          />

          {/* Formulário Venda */}
          <SalesForm />

          {/* Histórico */}
          <SalesList />

          {/* Grafico */}
          <SalesChart />

          <GenerateSalesPDF />

        </section>
      </div>
    </main>
  );
}