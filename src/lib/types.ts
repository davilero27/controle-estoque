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

  status:
    | "active"
    | "pending";
}

export interface OrganizationInvite {
  id: string;

  email: string;

  role: UserRole;

  status:
    | "pending"
    | "accepted"
    | "revoked";

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

  // Compatibilidade temporária
  produtoNome: string;

  quantidade: number;

  valorTotal: number;
}