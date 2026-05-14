"use client";
import {
    useEffect,
    useState,
} from "react";
import { db } from "@/lib/firestore";

import {
    collection,
    onSnapshot,
    query,
    orderBy,
} from "firebase/firestore";

interface Sale {
    id: string;
    produtoNome: string;
    quantidade: number;
    valorTotal: number;
    criadoEm?: {
        seconds: number;
    };
}

export function SalesList() {
    const [sales, setSales] =
        useState<Sale[]>([]);

    useEffect(() => {
        // Cria uma query ordenada por data de criação (mais recentes primeiro)
        const salesQuery = query(
            collection(db, "vendas"),
            orderBy("criadoEm", "desc")
        );

        // onSnapshot mantém a lista sincronizada em tempo real com o Firestore.
        // Sempre que um documento for adicionado, editado ou removido, o callback
        // é disparado automaticamente com o snapshot atualizado.
        const unsubscribe = onSnapshot(
            salesQuery,
            (snapshot) => {
                const salesList =
                    snapshot.docs.map(
                        (doc) => {
                            const data = doc.data();

                            // Usa o operador ?? (nullish coalescing) para garantir valores
                            // padrão caso os campos estejam ausentes no documento do Firestore
                            return {
                                id: doc.id,
                                produtoNome:
                                    data.produtoNome ?? "",
                                quantidade:
                                    Number(data.quantidade ?? 0),
                                valorTotal:
                                    Number(data.valorTotal ?? 0),
                                criadoEm: data.criadoEm,
                            };
                        }
                    );
                setSales(salesList);
            }
        );

        // Cancela a inscrição no listener ao desmontar o componente,
        // evitando memory leaks e atualizações em componentes desmontados
        return () => unsubscribe();
    }, []);

    // O Firestore armazena timestamps com o campo `seconds` (epoch Unix).
    // Multiplicamos por 1000 para converter para milissegundos, formato
    // esperado pelo construtor do Date do JavaScript.
    function formatDate(seconds?: number) {
        if (!seconds) {
            return "-";
        }
        return new Date(seconds * 1000).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    return (
        <div className="bg-zinc-900 p-6 rounded-2xl mt-6">
            <h2 className="text-2xl font-bold mb-6">
                Histórico de Vendas
            </h2>
            <div className="flex flex-col gap-4">
                {sales.map((sale) => (
                    <div
                        key={sale.id}
                        className="bg-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
                    >
                        <div>
                            <h3 className="font-semibold">
                                {sale.produtoNome}
                            </h3>
                            <p className="text-zinc-400 text-sm">
                                Quantidade: {sale.quantidade}
                            </p>
                        </div>
                        <div className="flex flex-col md:items-end">
                            <strong className="text-green-400">
                                R$ {sale.valorTotal.toFixed(2)}
                            </strong>
                            <span className="text-zinc-500 text-sm">
                                {formatDate(sale.criadoEm?.seconds)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}