export type UserRole =
  | "owner"
  | "admin"
  | "employee";

export type PaymentMethod =
  | "dinheiro"
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "boleto";

export type SaleStatus =
  | "pendente"
  | "paga"
  | "cancelada";

export interface Product {
  id: string;
  organizationId?: string;
  nome: string;
  preco: number;
  estoque: number;
  categoria?: string;
  sku?: string;
  codigoBarras?: string;
  estoqueMinimo?: number;
  fornecedor?: string;
  imageUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt?: {
    seconds: number;
  };
}

export interface OrganizationMember {
  uid: string;
  email: string;
  role: UserRole;
  status: "active" | "pending";
}

export interface OrganizationInvite {
  id: string;
  email: string;
  role: UserRole;
  status: "pending" | "accepted" | "revoked";
  createdAt?: {
    seconds: number;
  };
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  organizationId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  receiptUrl?: string;
  criadoEm?: {
    seconds: number;
  };
  canceladoEm?: {
    seconds: number;
  };
  // Campos computados para compatibilidade com dados legados no Firestore
  // Não gravar em novos documentos — derivar de items[]
  produtoNome?: string;
  quantidade?: number;
  valorTotal?: number;
}

// Helpers para derivar dados de items[] ou fallback para campos legados
export function getSaleProductName(sale: Sale): string {
  if (sale.items && sale.items.length > 0) {
    return sale.items.map((item) => item.productName).join(", ");
  }
  return sale.produtoNome ?? "";
}

export function getSaleQuantity(sale: Sale): number {
  if (sale.items && sale.items.length > 0) {
    return sale.items.reduce((acc, item) => acc + item.quantity, 0);
  }
  return sale.quantidade ?? 0;
}

export function getSaleTotal(sale: Sale): number {
  return sale.total ?? sale.valorTotal ?? 0;
}