"use client";

import {
    useEffect,
    useState,
} from "react";

import { db } from "@/lib/firestore";
import type { Product } from "@/lib/types";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
} from "firebase/firestore";

export function SalesForm() {
    // Lista de produtos carregados do Firestore
    const [products, setProducts] = useState<Product[]>([]);

    // ID do produto selecionado no dropdown
    const [selectedProductId, setSelectedProductId] = useState("");

    // Quantidade informada pelo usuário
    const [quantity, setQuantity] = useState("");

    // Carrega os produtos do Firestore ao montar o componente
    useEffect(() => {
        async function loadProducts() {
            try {
                const querySnapshot = await getDocs(collection(db, "produtos"));

                // Mapeia os documentos para o tipo Product, garantindo valores padrão
                const productsList = querySnapshot.docs.map((docSnap) => {
                    const data = docSnap.data();

                    return {
                        id: docSnap.id,
                        nome: data.nome ?? "",
                        preco: Number(data.preco ?? 0),
                        estoque: Number(data.estoque ?? 0),
                    };
                });

                setProducts(productsList);
            } catch (error) {
                console.log(error);
            }
        }

        loadProducts();
    }, []);

    async function handleCreateSale() {
        // Valida se os campos obrigatórios foram preenchidos
        if (!selectedProductId || !quantity) {
            alert("Preencha todos os campos");
            return;
        }

        // Busca o produto selecionado na lista local
        const product = products.find((product) => product.id === selectedProductId);

        if (!product) {
            alert("Produto inválido");
            return;
        }

        const quantityNumber = Number(quantity);

        // Verifica se há estoque suficiente para a venda
        if (quantityNumber > product.estoque) {
            alert("Estoque insuficiente");
            return;
        }

        try {
            // Registra a venda na coleção "vendas"
            await addDoc(collection(db, "vendas"), {
                produtoId: product.id,
                produtoNome: product.nome,
                quantidade: quantityNumber,
                valorUnitario: product.preco,
                valorTotal: product.preco * quantityNumber,
                criadoEm: new Date(),
            });

            // Decrementa o estoque do produto após a venda
            await updateDoc(doc(db, "produtos", product.id), {
                estoque: product.estoque - quantityNumber,
            });

            alert("Venda realizada com sucesso");

            // Limpa o formulário após o registro
            setSelectedProductId("");
            setQuantity("");
        } catch (error) {
            console.log(error);
            alert("Erro ao registrar venda");
        }
    }

    return (
        <div className="bg-zinc-900 p-6 rounded-2xl mt-6">
            <h2 className="text-2xl font-bold mb-6">Registrar Venda</h2>

            <div className="flex flex-col gap-4">
                {/* Dropdown para seleção do produto */}
                <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="bg-zinc-800 p-3 rounded-lg outline-none"
                >
                    <option value="">Selecione um produto</option>

                    {/* Exibe cada produto com seu estoque atual */}
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.nome} (Estoque: {product.estoque})
                        </option>
                    ))}
                </select>

                {/* Campo para informar a quantidade vendida */}
                <input
                    type="number"
                    placeholder="Quantidade"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-zinc-800 p-3 rounded-lg outline-none"
                />

                {/* Botão para confirmar o registro da venda */}
                <button
                    type="button"
                    onClick={handleCreateSale}
                    className="bg-green-600 hover:bg-green-700 transition p-3 rounded-lg"
                >
                    Registrar Venda
                </button>
            </div>
        </div>
    );
}