"use client";

import { useEffect, useState } from "react";

import { db } from "@/lib/firestore";


import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

interface Product {
  id: string;
  nome: string;
  preco: number;
}

interface ProductListProps {
  onEditProduct: (product: Product) => void;
  refreshTrigger: number;
}

export function ProductList({
  onEditProduct,
  refreshTrigger,
}: ProductListProps) {

const [products, setProducts] = useState<Product[]>([]);

// Função para carregar os produtos
async function loadProducts() {
  try {
    const querySnapshot = await getDocs(
      collection(db, "produtos")
    );

    const productsList: Product[] = [];

    querySnapshot.forEach((doc) => {
      productsList.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    setProducts(productsList);
  } catch (error) {
    console.log(error);
  }
}

// Função para deletar um produto
async function handleDeleteProduct(id: string) {
  try {
    await deleteDoc(doc(db, "produtos", id));

    loadProducts();
  } catch (error) {
    console.log(error);

    alert("Erro ao deletar produto");
  }
}

useEffect(() => {
  loadProducts();
}, [refreshTrigger]);

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl mt-6">
      <h2 className="text-2xl font-bold mb-6">
        Produtos
      </h2>

      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-zinc-800 p-4 rounded-xl flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold">
                {product.nome}
              </h3>
              <button
                onClick={() => onEditProduct(product)}
                className="bg-yellow-600 hover:bg-yellow-700 transition px-4 py-2 rounded-lg"
              >
                Editar
              </button>

              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg"
              >
                Excluir
              </button>

              <p className="text-zinc-400">
                R$ {product.preco}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}