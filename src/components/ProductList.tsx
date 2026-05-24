"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  Pencil,
  Trash2,
  Search,
  Package,
} from "lucide-react";

import { toast } from "sonner";

import { db } from "@/lib/firestore";

import type { Product } from "@/lib/types";

import { useAuth } from "@/contexts/AuthContext";

import { formatCurrency } from "@/utils/formatCurrency";

import {
  canManageProducts,
} from "@/utils/permissions";

import { Button } from "@/components/ui/Button";

import { Badge } from "@/components/ui/Badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { EmptyState } from "@/components/ui/EmptyState";

interface ProductListProps {
  onEditProduct: (
    product: Product
  ) => void;
  /** @deprecated O listener onSnapshot atualiza em tempo real — não é necessário. */
  refreshTrigger?: number;
}

export function ProductList({
  onEditProduct,
}: ProductListProps) {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    productToDelete,
    setProductToDelete,
  ] = useState<Product | null>(
    null
  );

  const {
    organizationId,
    role,
  } = useAuth();

  const canManage =
    canManageProducts(role);

  // Carregar produtos
  useEffect(() => {

    if (!organizationId) {
      return;
    }

    const productsQuery =
      query(
        collection(
          db,
          "organizations",
          organizationId,
          "produtos"
        ),

        orderBy(
          "nome",
          "asc"
        )
      );

    const unsubscribe =
      onSnapshot(
        productsQuery,

        (snapshot) => {

          const productsList =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            ) as Product[];

          setProducts(
            productsList
          );

          setLoading(false);
        },

        (error) => {
          console.error(
            "ERRO PRODUTOS:",
            error
          );
        }
      );

    return () => unsubscribe();

  }, [organizationId]);

  // Filtrar produtos
  const filteredProducts =
    useMemo(() => {

      return products.filter(
        (product) =>
          product.nome
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

    }, [products, search]);

  // Excluir produto
  async function handleDeleteProduct() {

    if (
      !organizationId ||
      !productToDelete
    ) {
      return;
    }

    try {

      await deleteDoc(
        doc(
          db,
          "organizations",
          organizationId,
          "produtos",
          productToDelete.id
        )
      );

      toast.success(
        "Produto excluído com sucesso"
      );

      setProductToDelete(
        null
      );

    } catch {

      toast.error(
        "Erro ao excluir produto"
      );
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-zinc-400">
          Carregando produtos...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Pesquisa */}
      <div className="relative">

        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

        <input
          type="text"
          placeholder="Pesquisar produto..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500"
        />

      </div>

      {/* Estado vazio */}
      {filteredProducts.length ===
        0 ? (

        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description="Não existem produtos cadastrados."
        />

      ) : (

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>
                Produto
              </TableHead>

              <TableHead>
                Categoria
              </TableHead>

              <TableHead>
                Estoque
              </TableHead>

              <TableHead>
                Preço
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead>
                Ações
              </TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

            {filteredProducts.map(
              (product) => {

                const lowStock =
                  product.estoque <=
                  (product.estoqueMinimo ??
                    5);

                return (
                  <TableRow
                    key={product.id}
                  >

                    {/* Produto */}
                    <TableCell>

                      <div>

                        <p className="font-medium text-white">
                          {
                            product.nome
                          }
                        </p>

                        {product.sku && (
                          <p className="text-xs text-zinc-500">
                            SKU:{" "}
                            {
                              product.sku
                            }
                          </p>
                        )}

                      </div>

                    </TableCell>

                    {/* Categoria */}
                    <TableCell>
                      {
                        product.categoria ??
                        "-"
                      }
                    </TableCell>

                    {/* Estoque */}
                    <TableCell>
                      {
                        product.estoque
                      }
                    </TableCell>

                    {/* Preço */}
                    <TableCell>
                      {formatCurrency(
                        product.preco
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>

                      {lowStock ? (
                        <Badge variant="danger">
                          Baixo
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          Normal
                        </Badge>
                      )}

                    </TableCell>

                    {/* Ações */}
                    <TableCell>

                      <div className="flex items-center gap-2">

                        {/* Editar */}
                        {canManage && (
                          <Button
                            onClick={() =>
                              onEditProduct(
                                product
                              )
                            }
                          >

                            <Pencil className="h-4 w-4" />

                          </Button>
                        )}

                        {/* Excluir */}
                        {canManage && (
                          <Button
                            variant="danger"
                            onClick={() =>
                              setProductToDelete(
                                product
                              )
                            }
                          >

                            <Trash2 className="h-4 w-4" />

                          </Button>
                        )}

                      </div>

                    </TableCell>

                  </TableRow>
                );
              }
            )}

          </TableBody>

        </Table>
      )}

      {/* Modal exclusão */}
      {productToDelete && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

            <h2 className="text-xl font-bold text-white">
              Excluir produto
            </h2>

            <p className="mt-2 text-zinc-400">
              Deseja realmente excluir:
            </p>

            <p className="mt-1 font-medium text-white">
              {
                productToDelete.nome
              }
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <Button
                onClick={() =>
                  setProductToDelete(
                    null
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                variant="danger"
                onClick={
                  handleDeleteProduct
                }
              >
                Excluir
              </Button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}