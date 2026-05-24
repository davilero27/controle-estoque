"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import type { Product } from "@/lib/types";

import { useAuth } from "@/contexts/AuthContext";

import { getProductsCollection } from "@/services/products";

const LOW_STOCK_THRESHOLD = 5;

export function useProducts() {
  const { organizationId } = useAuth();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const productsQuery = query(
      getProductsCollection(organizationId),
      orderBy("nome", "asc"),
      limit(250)
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const productsList =
          snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              organizationId:
                data.organizationId ?? organizationId,
              nome: data.nome ?? "",
              preco: Number(data.preco ?? 0),
              estoque: Number(data.estoque ?? 0),
              categoria: data.categoria ?? "",
              sku: data.sku ?? "",
              codigoBarras: data.codigoBarras ?? "",
              estoqueMinimo: Number(
                data.estoqueMinimo ?? LOW_STOCK_THRESHOLD
              ),
              fornecedor: data.fornecedor ?? "",
              imageUrl: data.imageUrl ?? "",
            };
          });

        setProducts(productsList);
        setLoading(false);
      },
      (error) => {
        console.error("useProducts error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  const totalProducts = products.length;

  const totalStockValue = useMemo(
    () =>
      products.reduce(
        (acc, product) =>
          acc + product.preco * product.estoque,
        0
      ),
    [products]
  );

  const lowStockItems = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.estoque <=
            (product.estoqueMinimo ?? LOW_STOCK_THRESHOLD)
        )
        .sort((a, b) => a.estoque - b.estoque),
    [products]
  );

  const lowStockProducts = lowStockItems.length;

  // Produtos recentes: ordenados por criação (os últimos 5 inseridos)
  // Como a query usa orderBy("nome"), pegamos os primeiros 5 por ora
  // Ideal: query separada com orderBy("criadoEm", "desc") limit(5)
  const recentProducts = useMemo(
    () => [...products].slice(0, 5),
    [products]
  );

  return {
    products,
    loading,
    totalProducts,
    totalStockValue,
    lowStockProducts,
    lowStockItems,
    recentProducts,
  };
}