"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  AlertTriangle,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import type {
  PaymentMethod,
  Product,
  SaleItem,
  SaleStatus,
} from "@/lib/types";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";

import { useAuth } from "@/contexts/AuthContext";

import { getProductsCollection } from "@/services/products";

import { createSale } from "@/services/sales";

import {
  getValidationMessage,
  saleSchema,
} from "@/lib/validation";

import { formatCurrency } from "@/utils/formatCurrency";

import { toast } from "sonner";

export function SalesForm() {
  const { organizationId } = useAuth();

  const [products, setProducts] =
    useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] =
    useState("");
  const [quantity, setQuantity] =
    useState("1");
  const [items, setItems] =
    useState<SaleItem[]>([]);
  const [discount, setDiscount] =
    useState("0");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("pix");
  const [status, setStatus] =
    useState<SaleStatus>("paga");
  const [receiptUrl, setReceiptUrl] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    const productsQuery = query(
      getProductsCollection(organizationId),
      orderBy("nome", "asc"),
      limit(250)
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (querySnapshot) => {
        const productsList =
          querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();

            return {
              id: docSnap.id,
              organizationId,
              nome: data.nome ?? "",
              preco: Number(data.preco ?? 0),
              estoque: Number(data.estoque ?? 0),
              categoria: data.categoria ?? "",
              sku: data.sku ?? "",
              codigoBarras: data.codigoBarras ?? "",
              estoqueMinimo: Number(
                data.estoqueMinimo ?? 5
              ),
              fornecedor: data.fornecedor ?? "",
              imageUrl: data.imageUrl ?? "",
            };
          });

        setProducts(productsList);
      },
      (error) => {
        console.log(error);
        toast.error("Erro ao carregar produtos");
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + item.subtotal,
        0
      ),
    [items]
  );

  const discountNumber = Number(discount || 0);
  const total = Math.max(
    0,
    subtotal - discountNumber
  );

  function handleAddItem() {
    if (!selectedProduct) {
      toast.info("Selecione um produto");
      return;
    }

    const quantityNumber = Number(quantity);

    if (
      !Number.isInteger(quantityNumber) ||
      quantityNumber <= 0
    ) {
      toast.error("Informe uma quantidade válida");
      return;
    }

    const currentQuantity =
      items.find(
        (item) =>
          item.productId === selectedProduct.id
      )?.quantity ?? 0;

    if (
      currentQuantity + quantityNumber >
      selectedProduct.estoque
    ) {
      toast.error("Estoque insuficiente");
      return;
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.productId === selectedProduct.id
      );

      if (existingItem) {
        return currentItems.map((item) => {
          if (item.productId !== selectedProduct.id) {
            return item;
          }

          const nextQuantity =
            item.quantity + quantityNumber;

          return {
            ...item,
            quantity: nextQuantity,
            subtotal:
              nextQuantity * item.unitPrice,
          };
        });
      }

      return [
        ...currentItems,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.nome,
          quantity: quantityNumber,
          unitPrice: selectedProduct.preco,
          subtotal:
            selectedProduct.preco * quantityNumber,
        },
      ];
    });

    setSelectedProductId("");
    setQuantity("1");
  }

  function handleChangeItemQuantity(
    productId: string,
    direction: "increase" | "decrease"
  ) {
    setItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.productId !== productId) {
            return item;
          }

          const product = products.find(
            (currentProduct) =>
              currentProduct.id === productId
          );

          const nextQuantity =
            direction === "increase"
              ? item.quantity + 1
              : item.quantity - 1;

          if (
            product &&
            nextQuantity > product.estoque
          ) {
            toast.error("Estoque insuficiente");
            return item;
          }

          return {
            ...item,
            quantity: nextQuantity,
            subtotal:
              nextQuantity * item.unitPrice,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  async function handleCreateSale() {
    if (!organizationId) {
      toast.error("Organização não identificada");
      return;
    }

    const payload = {
      items,
      subtotal,
      discount: discountNumber,
      total,
      paymentMethod,
      status,
      receiptUrl,
    };

    const validation = saleSchema.safeParse(payload);

    if (!validation.success) {
      toast.error(getValidationMessage(validation.error));
      return;
    }

    if (discountNumber > subtotal) {
      toast.error("O desconto não pode superar o subtotal");
      return;
    }

    try {
      setLoading(true);

      await createSale({
        organizationId,
        ...payload,
      });

      toast.success("Venda realizada com sucesso");
      setSelectedProductId("");
      setQuantity("1");
      setItems([]);
      setDiscount("0");
      setPaymentMethod("pix");
      setStatus("paga");
      setReceiptUrl("");
    } catch (error) {
      console.log(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao registrar venda"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      id="sales"
      className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-green-500/20 sm:p-6"
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-2xl bg-emerald-600 p-3 shadow-lg shadow-green-500/20">
          <ShoppingCart className="h-6 w-6 text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Registrar Venda
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Venda com múltiplos produtos e baixa automática de estoque.
          </p>
        </div>
      </div>

      {selectedProduct &&
        selectedProduct.estoque <=
          (selectedProduct.estoqueMinimo ?? 5) && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />

            <p className="text-sm text-red-300">
              Atenção: este produto está com estoque baixo.
            </p>
          </div>
        )}

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[1fr_140px_auto] md:items-end">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Produto
              </label>

              <select
                value={selectedProductId}
                onChange={(e) =>
                  setSelectedProductId(e.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
              >
                <option value="">
                  Selecione um produto
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.nome} - Estoque:{" "}
                    {product.estoque}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Quantidade
              </label>

              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
              />
            </div>

            <Button
              type="button"
              onClick={handleAddItem}
              className="flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {selectedProduct && (
            <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <Package className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <p className="text-lg font-semibold">
                    {selectedProduct.nome}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Produto selecionado
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-zinc-500">
                    Preço
                  </p>
                  <strong className="text-green-400">
                    {formatCurrency(selectedProduct.preco)}
                  </strong>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Estoque
                  </p>
                  <strong>
                    {selectedProduct.estoque}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                Nenhum produto adicionado à venda
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {item.productName}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {formatCurrency(item.unitPrice)} un.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleChangeItemQuantity(
                              item.productId,
                              "decrease"
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleChangeItemQuantity(
                              item.productId,
                              "increase"
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <strong className="min-w-24 text-right text-green-400">
                        {formatCurrency(item.subtotal)}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          setItems((currentItems) =>
                            currentItems.filter(
                              (currentItem) =>
                                currentItem.productId !==
                                item.productId
                            )
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400"
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Desconto
            </label>
            <Input
              type="number"
              min={0}
              value={discount}
              onChange={(e) =>
                setDiscount(e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Método de pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as PaymentMethod
                )
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">
                Cartão de crédito
              </option>
              <option value="cartao_debito">
                Cartão de débito
              </option>
              <option value="boleto">Boleto</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as SaleStatus)
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="paga">Paga</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Comprovante
            </label>
            <Input
              type="url"
              placeholder="URL do comprovante"
              value={receiptUrl}
              onChange={(e) =>
                setReceiptUrl(e.target.value)
              }
            />
          </div>

          <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm text-zinc-400">
              <span>Desconto</span>
              <span>
                - {formatCurrency(discountNumber || 0)}
              </span>
            </div>

            <div className="flex justify-between border-t border-zinc-800 pt-3 text-lg font-bold text-white">
              <span>Total</span>
              <span className="text-green-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="success"
            onClick={handleCreateSale}
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Registrando..."
              : "Registrar Venda"}
          </Button>
        </div>
      </div>
    </div>
  );
}
