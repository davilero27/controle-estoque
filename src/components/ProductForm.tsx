"use client";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firestore";
import type { Product } from "@/lib/types";

interface ProductFormProps {
  editingProduct?: Product | null;
  onFinishEdit?: () => void;
  onProductCreated?: () => void;
}

export function ProductForm({
  editingProduct,
  onFinishEdit,
  onProductCreated,
}: ProductFormProps) {

  // Estados do formulário
  const [nome, setNome] =
    useState("");

  const [preco, setPreco] =
    useState("");

  const [estoque, setEstoque] =
    useState("");

  // Preenche o formulário ao editar um produto
  useEffect(() => {
    if (editingProduct) {
      setNome(editingProduct.nome);

      setPreco(
        String(editingProduct.preco)
      );

      setEstoque(
        String(
          editingProduct.estoque || ""
        )
      );
    }
  }, [editingProduct]);

  async function handleCreateProduct() {

    // Validação básica
    if (!nome || !preco || !estoque) {
      alert("Preencha todos os campos");

      return;
    }

    try {

      // EDITAR PRODUTO
      if (editingProduct) {

        await updateDoc(
          doc(
            db,
            "produtos",
            editingProduct.id
          ),
          {
            nome,
            preco: Number(preco),
            estoque: Number(estoque),
          }
        );

        alert("Produto atualizado");

        onFinishEdit?.();

      } else {

        // CRIAR PRODUTO
        await addDoc(
          collection(db, "produtos"),
          {
            nome,
            preco: Number(preco),
            estoque: Number(estoque),
            criadoEm: new Date(),
          }
        );

        alert(
          "Produto criado com sucesso"
        );

        onProductCreated?.();
      }

      // Limpa formulário
      setNome("");
      setPreco("");
      setEstoque("");

    } catch (error) {

      console.log(error);

      alert("Erro ao salvar produto");
    }
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl mt-6 max-w-md">

      {/* Título */}
      <h2 className="text-xl font-bold mb-4">
        {editingProduct
          ? "Editar Produto"
          : "Novo Produto"}
      </h2>

      <div className="flex flex-col gap-4">

        <input
          type="text"
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          className="bg-zinc-800 p-3 rounded-lg outline-none"
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) =>
            setPreco(e.target.value)
          }
          className="bg-zinc-800 p-3 rounded-lg outline-none"
        />

        <input
          type="number"
          placeholder="Quantidade em estoque"
          value={estoque}
          onChange={(e) =>
            setEstoque(e.target.value)
          }
          className="bg-zinc-800 p-3 rounded-lg outline-none"
        />

        <button
          type="button"
          onClick={handleCreateProduct}
          className="bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg"
        >
          {editingProduct
            ? "Atualizar Produto"
            : "Salvar Produto"}
        </button>

      </div>
    </div>
  );
}