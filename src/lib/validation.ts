import { z } from "zod";

export const productSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres"),
  preco: z
    .number()
    .positive("O preço deve ser maior que zero"),
  estoque: z
    .number()
    .int("O estoque deve ser um número inteiro")
    .min(0, "O estoque não pode ser negativo"),
  categoria: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  codigoBarras: z.string().trim().optional(),
  estoqueMinimo: z
    .number()
    .int("O estoque mínimo deve ser inteiro")
    .min(0, "O estoque mínimo não pode ser negativo")
    .optional(),
  fornecedor: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  productName: z.string().min(1, "Produto inválido"),
  quantity: z
    .number()
    .int("A quantidade deve ser inteira")
    .positive("A quantidade deve ser maior que zero"),
  unitPrice: z
    .number()
    .min(0, "O preço unitário não pode ser negativo"),
  subtotal: z
    .number()
    .min(0, "O subtotal não pode ser negativo"),
});

export const saleSchema = z.object({
  items: z
    .array(saleItemSchema)
    .min(1, "Adicione pelo menos um produto"),
  subtotal: z
    .number()
    .min(0, "O subtotal não pode ser negativo"),
  discount: z
    .number()
    .min(0, "O desconto não pode ser negativo"),
  total: z
    .number()
    .min(0, "O total não pode ser negativo"),
  paymentMethod: z.enum([
    "dinheiro",
    "pix",
    "cartao_credito",
    "cartao_debito",
    "boleto",
  ]),
  status: z.enum(["pendente", "paga", "cancelada"]),
  receiptUrl: z.string().trim().optional(),
});

export function getValidationMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Revise os campos";
  }

  return "Revise os campos";
}
