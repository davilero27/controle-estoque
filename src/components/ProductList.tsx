"use client";

import { useCallback, useEffect, useState } from "react";

import { db } from "@/lib/firestore";
import type { Product } from "@/lib/types";

import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

interface ProductListProps {
  onEditProduct: (product: Product) => void;
  refreshTrigger: number;
}

export function ProductList({
  onEditProduct,
  refreshTrigger,
}: ProductListProps) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [showLowStock, setShowLowStock] =
    useState(false);

  const [sortBy, setSortBy] =
    useState("nome");

  // Converte os dados do Firestore
  const mapProduct = useCallback(
    (
      docSnap: {
        id: string;
        data: () => unknown;
      }
    ): Product => {
      const data = docSnap.data() as {
        nome?: string;
        preco?: unknown;
        estoque?: unknown;
      };

      return {
        id: docSnap.id,
        nome: data.nome ?? "",
        preco: Number(data.preco ?? 0),
        estoque: Number(
          data.estoque ?? 0
        ),
      };
    },
    []
  );

  async function handleDeleteProduct(
    id: string
  ) {
    try {
      await deleteDoc(
        doc(db, "produtos", id)
      );
    } catch (error) {
      console.log(error);

      alert("Erro ao deletar produto");
    }
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "produtos"),
      (querySnapshot) => {
        setProducts(
          querySnapshot.docs.map(
            mapProduct
          )
        );
      },
      (error) => {
        console.log(error);
      }
    );

    return () => unsubscribe();
  }, [mapProduct, refreshTrigger]);

  // Pesquisa + filtro + ordenação
  const filteredProducts =
    products
      .filter((product) => {
        const matchesSearch =
          product.nome
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesLowStock =
          !showLowStock ||
          product.estoque <= 5;

        return (
          matchesSearch &&
          matchesLowStock
        );
      })
      .sort((a, b) => {
        if (sortBy === "nome") {
          return a.nome.localeCompare(
            b.nome
          );
        }

        if (sortBy === "preco") {
          return b.preco - a.preco;
        }

        if (sortBy === "estoque") {
          return (
            b.estoque - a.estoque
          );
        }

        return 0;
      });

  return (
    <div
      id="products"
      className="bg-zinc-900 p-6 rounded-2xl mt-6"
    >
      <h2 className="text-2xl font-bold mb-6">
        Produtos
      </h2>

      {/* Pesquisa */}
      <input
        type="text"
        placeholder="Pesquisar produto..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full bg-zinc-800 p-3 rounded-lg outline-none mb-4"
      />

      {/* Filtro estoque baixo */}
      <button
        type="button"
        onClick={() =>
          setShowLowStock(
            !showLowStock
          )
        }
        className={`w-full mb-4 px-4 py-3 rounded-lg transition ${
          showLowStock
            ? "bg-red-600"
            : "bg-zinc-800"
        }`}
      >
        {showLowStock
          ? "Mostrando estoque baixo"
          : "Mostrar apenas estoque baixo"}
      </button>

      {/* Ordenação */}
      <select
        value={sortBy}
        onChange={(e) =>
          setSortBy(e.target.value)
        }
        className="w-full bg-zinc-800 p-3 rounded-lg outline-none mb-6"
      >
        <option value="nome">
          Ordenar por Nome
        </option>

        <option value="preco">
          Ordenar por Preço
        </option>

        <option value="estoque">
          Ordenar por Estoque
        </option>
      </select>

      {/* Lista */}
      <div className="flex flex-col gap-4">
        {filteredProducts.map(
          (product) => (
            <div
              key={product.id}
              className="bg-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold">
                  {product.nome}
                </h3>

                <p className="text-zinc-400 text-sm">
                  Estoque:{" "}
                  {product.estoque}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-zinc-400 font-medium">
                  R$ {product.preco}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() =>
                      onEditProduct(product)
                    }
                    className="bg-yellow-600 hover:bg-yellow-700 transition px-4 py-2 rounded-lg w-full sm:w-auto"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteProduct(
                        product.id
                      )
                    }
                    className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg w-full sm:w-auto"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}