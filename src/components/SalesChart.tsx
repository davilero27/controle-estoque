"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    collection,
    onSnapshot,
} from "firebase/firestore";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { db } from "@/lib/firestore";

interface ChartData {
    name: string;
    total: number;
}

export function SalesChart() {
    const [data, setData] =
        useState<ChartData[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "vendas"),
            (snapshot) => {
                const sales =
                    snapshot.docs.map(
                        (doc) => {
                            const sale =
                                doc.data();

                            return {
                                produtoNome:
                                    sale.produtoNome ||
                                    "",

                                valorTotal: Number(
                                    sale.valorTotal || 0
                                ),
                            };
                        }
                    );

                const groupedSales:
                    Record<
                        string,
                        number
                    > = {};

                sales.forEach((sale) => {
                    if (
                        groupedSales[
                        sale.produtoNome
                        ]
                    ) {
                        groupedSales[
                            sale.produtoNome
                        ] += sale.valorTotal;
                    } else {
                        groupedSales[
                            sale.produtoNome
                        ] = sale.valorTotal;
                    }
                });

                const chartData =
                    Object.entries(
                        groupedSales
                    ).map(
                        ([name, total]) => ({
                            name,
                            total,
                        })
                    );

                setData(chartData);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-zinc-900 p-6 rounded-2xl mt-6">
            <h2 className="text-2xl font-bold mb-6">
                Vendas por Produto
            </h2>

            <div className="w-full h-[350px]">
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <XAxis dataKey="name" />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="total"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}