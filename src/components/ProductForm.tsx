"use client";

import { useEffect, useState } from "react";

import { db } from "@/lib/firestore";

import { addDoc, collection, updateDoc, doc } from "firebase/firestore";


interface ProductFormProps {
  editingProduct?: any;
  onFinishEdit?: () => void;
  onProductCreated?: () => void;
}

export function ProductForm({
  editingProduct,
  onFinishEdit,
  onProductCreated,
}: ProductFormProps) {

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  useEffect(() => {
    if (editingProduct) {
      setNome(editingProduct.nome);
      setPreco(editingProduct.preco);
    }
  }, [editingProduct]);

  async function handleCreateProduct() {
    if (!nome || !preco) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      if (editingProduct) {
        await updateDoc(
          doc(db, "produtos", editingProduct.id),
          {
            nome,
            preco: Number(preco),
          }
        );

        alert("Produto atualizado");

        onFinishEdit?.();
      } else {
        await addDoc(collection(db, "produtos"), {
          nome,
          preco: Number(preco),
          criadoEm: new Date(),
        });

        alert("Produto criado com sucesso");

        onProductCreated?.();
      }

      setNome("");
      setPreco("");
    } catch (error) {
      console.log(error);

      alert("Erro ao salvar produto");
    }
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl mt-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">
        Novo Produto
      </h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="bg-zinc-800 p-3 rounded-lg outline-none"
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="bg-zinc-800 p-3 rounded-lg outline-none"
        />

        <button
          onClick={handleCreateProduct}
          className="bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg"
        >
          Salvar Produto
        </button>
      </div>
    </div>
  );
}