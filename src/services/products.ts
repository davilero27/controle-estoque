import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firestore";

import { getProductsPath } from "@/lib/tenant";

import type { Product } from "@/lib/types";

export type ProductPayload =
  Omit<Product, "id" | "organizationId">;

export function getProductsCollection(
  organizationId: string
) {
  return collection(
    db,
    getProductsPath(organizationId)
  );
}

export function getProductDocument(
  organizationId: string,
  productId: string
) {
  return doc(
    db,
    getProductsPath(organizationId),
    productId
  );
}

export async function createProduct(
  organizationId: string,
  product: ProductPayload
) {
  return addDoc(
    getProductsCollection(organizationId),
    {
      ...product,
      organizationId,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    }
  );
}

export async function updateProduct(
  organizationId: string,
  id: string,
  product: Partial<ProductPayload>
) {
  return updateDoc(
    getProductDocument(organizationId, id),
    {
      ...product,
      atualizadoEm: serverTimestamp(),
    }
  );
}

export async function deleteProduct(
  organizationId: string,
  id: string
) {
  return deleteDoc(
    getProductDocument(organizationId, id)
  );
}
