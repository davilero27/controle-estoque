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
import {
  getSaleProductName,
  getSaleQuantity,
  getSaleTotal,
} from "@/lib/types";

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);

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

          const base: BaseSale = {
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
            criadoEm: data.criadoEm,
            canceladoEm: data.canceladoEm,
            // Preserva campos legados para compatibilidade
            produtoNome: data.produtoNome,
            quantidade: data.quantidade,
            valorTotal: data.valorTotal,
          };

          return {
            ...base,
            date: parseFirestoreDate(data.criadoEm),
          };
        });

        setSales(salesList);
        setLoading(false);
      },
      (error) => {
        console.error("useSales error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  const totalRevenue = useMemo(
    () =>
      sales
        .filter((s) => s.status !== "cancelada")
        .reduce((acc, sale) => acc + getSaleTotal(sale), 0),
    [sales]
  );

  const topProduct = useMemo(() => {
    const productsMap: Record<string, number> = {};

    sales
      .filter((s) => s.status !== "cancelada")
      .forEach((sale) => {
        if (sale.items && sale.items.length > 0) {
          sale.items.forEach((item) => {
            productsMap[item.productName] =
              (productsMap[item.productName] ?? 0) +
              item.quantity;
          });
        } else {
          const name = getSaleProductName(sale);
          if (name) {
            productsMap[name] =
              (productsMap[name] ?? 0) +
              getSaleQuantity(sale);
          }
        }
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

    const activeSales = sales.filter(
      (s) => s.status !== "cancelada"
    );

    const todaySales = activeSales.filter(
      (sale) =>
        sale.date && isSameDay(sale.date, today)
    );

    const yesterdaySales = activeSales.filter(
      (sale) =>
        sale.date && isSameDay(sale.date, yesterday)
    );

    const salesTodayCount = todaySales.length;
    const revenueToday = todaySales.reduce(
      (acc, sale) => acc + getSaleTotal(sale),
      0
    );
    const revenueYesterday = yesterdaySales.reduce(
      (acc, sale) => acc + getSaleTotal(sale),
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
    const result: { name: string; total: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayTotal = sales
        .filter((sale) => {
          if (!sale.date) return false;
          if (sale.status === "cancelada") return false;
          const saleDate = new Date(sale.date);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === date.getTime();
        })
        .reduce((acc, sale) => acc + getSaleTotal(sale), 0);

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
    loading,
    totalRevenue,
    topProduct,
    recentSales,
    last7DaysChart,
    ...todayStats,
  };
}