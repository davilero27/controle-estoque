import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firestore";

import {
  getProductsPath,
  getSalesPath,
} from "@/lib/tenant";

import type {
  PaymentMethod,
  SaleItem,
  SaleStatus,
} from "@/lib/types";

interface CreateSaleParams {
  organizationId: string;
  items: SaleItem[];
  discount: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  receiptUrl?: string;
}

export function getSalesCollection(
  organizationId: string
) {
  return collection(db, getSalesPath(organizationId));
}

export function getSaleDocument(
  organizationId: string,
  saleId: string
) {
  return doc(db, getSalesPath(organizationId), saleId);
}

export async function createSale({
  organizationId,
  items,
  discount,
  paymentMethod,
  status,
  receiptUrl,
}: CreateSaleParams) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );
  const total = Math.max(0, subtotal - discount);

  await runTransaction(db, async (transaction) => {
    const productRefs = items.map((item) =>
      doc(
        db,
        getProductsPath(organizationId),
        item.productId
      )
    );

    const productSnapshots = await Promise.all(
      productRefs.map((productRef) =>
        transaction.get(productRef)
      )
    );

    productSnapshots.forEach((snapshot, index) => {
      const item = items[index];

      if (!snapshot.exists()) {
        throw new Error(
          `Produto ${item.productName} não encontrado`
        );
      }

      const currentStock = Number(
        snapshot.data().estoque ?? 0
      );

      if (item.quantity > currentStock) {
        throw new Error(
          `Estoque insuficiente para ${item.productName}`
        );
      }
    });

    productSnapshots.forEach((snapshot, index) => {
      const item = items[index];
      const productRef = productRefs[index];

      if (!item || !productRef || !snapshot.exists()) {
        return;
      }

      const productData = snapshot.data();
      const currentStock = Number(
        productData.estoque ?? 0
      );

      transaction.update(productRef, {
        estoque: currentStock - item.quantity,
        atualizadoEm: serverTimestamp(),
      });
    });

    const saleRef = doc(
      collection(db, getSalesPath(organizationId))
    );

    transaction.set(saleRef, {
      organizationId,
      items,
      subtotal,
      discount,
      total,
      paymentMethod,
      status,
      receiptUrl: receiptUrl ?? "",
      produtoNome: items
        .map((item) => item.productName)
        .join(", "),
      quantidade: items.reduce(
        (acc, item) => acc + item.quantity,
        0
      ),
      valorTotal: total,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
  });
}

export async function cancelSale(
  organizationId: string,
  saleId: string
) {
  const saleRef = getSaleDocument(
    organizationId,
    saleId
  );

  await runTransaction(db, async (transaction) => {
    const saleSnapshot =
      await transaction.get(saleRef);

    if (!saleSnapshot.exists()) {
      throw new Error("Venda não encontrada");
    }

    const sale = saleSnapshot.data() as {
      status?: SaleStatus;
      items?: SaleItem[];
    };

    if (sale.status === "cancelada") {
      throw new Error("Venda já cancelada");
    }

    const items = sale.items ?? [];
    const productRefs = items.map((item) =>
      doc(
        db,
        getProductsPath(organizationId),
        item.productId
      )
    );

    const productSnapshots = await Promise.all(
      productRefs.map((productRef) =>
        transaction.get(productRef)
      )
    );

    productSnapshots.forEach((snapshot, index) => {
      const item = items[index];
      const productRef = productRefs[index];

      if (!item || !productRef || !snapshot.exists()) {
        return;
      }

      const productData = snapshot.data();
      const currentStock = Number(
        productData.estoque ?? 0
      );

      transaction.update(productRef, {
        estoque:
          currentStock + item.quantity,
        atualizadoEm: serverTimestamp(),
      });
    });

    transaction.update(saleRef, {
      status: "cancelada",
      canceladoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
  });
}

export async function updateSaleStatus(
  organizationId: string,
  saleId: string,
  status: SaleStatus
) {
  const saleRef = getSaleDocument(
    organizationId,
    saleId
  );

  const snapshot = await getDoc(saleRef);

  if (!snapshot.exists()) {
    throw new Error("Venda não encontrada");
  }

  return updateDoc(saleRef, {
    status,
    atualizadoEm: serverTimestamp(),
  });
}
