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

import {
  parseFirestoreDate,
  isSameDay,
} from "@/utils/parseFirestoreDate";

import { useAuth } from "@/contexts/AuthContext";

import { getSalesCollection } from "@/services/sales";

import type { Sale as BaseSale } from "@/lib/types";

export interface Sale extends BaseSale {
  date: Date | null;
}

const DAY_LABELS = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
];

export function useSales() {
  const { organizationId } = useAuth();

  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    const salesQuery = query(
      getSalesCollection(organizationId),
      orderBy("criadoEm", "desc"),
      limit(250)
    );

    const unsubscribe = onSnapshot(
      salesQuery,
      (snapshot) => {
        const salesList = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            organizationId:
              data.organizationId ?? organizationId,
            items: data.items ?? [],
            subtotal: Number(
              data.subtotal ?? data.valorTotal ?? 0
            ),
            discount: Number(data.discount ?? 0),
            total: Number(
              data.total ?? data.valorTotal ?? 0
            ),
            paymentMethod:
              data.paymentMethod ?? "dinheiro",
            status: data.status ?? "paga",
            receiptUrl: data.receiptUrl ?? "",
            produtoNome:
              data.produtoNome ??
              (data.items ?? [])
                .map(
                  (item: { productName?: string }) =>
                    item.productName
                )
                .filter(Boolean)
                .join(", "),
            quantidade: Number(
              data.quantidade ??
                (data.items ?? []).reduce(
                  (
                    acc: number,
                    item: { quantity?: number }
                  ) => acc + Number(item.quantity ?? 0),
                  0
                )
            ),
            valorTotal: Number(
              data.valorTotal ?? data.total ?? 0
            ),
            criadoEm: data.criadoEm,
            canceladoEm: data.canceladoEm,
            date: parseFirestoreDate(data.criadoEm),
          };
        });

        setSales(salesList);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  const totalRevenue = useMemo(
    () =>
      sales.reduce(
        (acc, sale) => acc + sale.valorTotal,
        0
      ),
    [sales]
  );

  const topProduct = useMemo(() => {
    const productsMap: Record<string, number> = {};

    sales.forEach((sale) => {
      productsMap[sale.produtoNome] =
        (productsMap[sale.produtoNome] ?? 0) +
        sale.quantidade;
    });

    let bestProduct = "";
    let bestQuantity = 0;

    Object.entries(productsMap).forEach(
      ([name, quantity]) => {
        if (quantity > bestQuantity) {
          bestQuantity = quantity;
          bestProduct = name;
        }
      }
    );

    return bestProduct;
  }, [sales]);

  const todayStats = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todaySales = sales.filter(
      (sale) =>
        sale.date && isSameDay(sale.date, today)
    );

    const yesterdaySales = sales.filter(
      (sale) =>
        sale.date &&
        isSameDay(sale.date, yesterday)
    );

    const salesTodayCount = todaySales.length;
    const revenueToday = todaySales.reduce(
      (acc, sale) => acc + sale.valorTotal,
      0
    );
    const revenueYesterday = yesterdaySales.reduce(
      (acc, sale) => acc + sale.valorTotal,
      0
    );

    const salesDiff =
      salesTodayCount - yesterdaySales.length;

    const revenueDiff =
      revenueYesterday > 0
        ? Math.round(
            ((revenueToday - revenueYesterday) /
              revenueYesterday) *
              100
          )
        : revenueToday > 0
          ? 100
          : 0;

    return {
      salesTodayCount,
      revenueToday,
      salesDiff,
      revenueDiff,
    };
  }, [sales]);

  const last7DaysChart = useMemo(() => {
    const result: { name: string; total: number }[] =
      [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayTotal = sales
        .filter((sale) => {
          if (!sale.date) return false;
          const saleDate = new Date(sale.date);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === date.getTime();
        })
        .reduce(
          (acc, sale) => acc + sale.valorTotal,
          0
        );

      result.push({
        name: DAY_LABELS[date.getDay()],
        total: dayTotal,
      });
    }

    return result;
  }, [sales]);

  const recentSales = useMemo(
    () => sales.slice(0, 5),
    [sales]
  );

  return {
    sales,
    totalRevenue,
    topProduct,
    recentSales,
    last7DaysChart,
    ...todayStats,
  };
}
