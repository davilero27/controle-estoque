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
  ShoppingBag,
  Search,
  TrendingUp,
  Eye,
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/Table";

import { EmptyState } from "@/components/ui/EmptyState";

import { Input } from "@/components/ui/Input";

import { Button } from "@/components/ui/Button";

import { Modal } from "@/components/ui/Modal";

import { formatCurrency } from "@/utils/formatCurrency";

import { formatDate } from "@/utils/formatDate";

import { useAuth } from "@/contexts/AuthContext";

import {
  cancelSale,
  getSalesCollection,
} from "@/services/sales";

import type { Sale } from "@/lib/types";

import { toast } from "sonner";

export function SalesList() {

  const { organizationId } =
    useAuth();

  const [sales, setSales] =
    useState<Sale[]>([]);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    selectedSale,
    setSelectedSale,
  ] = useState<Sale | null>(
    null
  );

  const [
    cancelingSaleId,
    setCancelingSaleId,
  ] = useState<string | null>(
    null
  );

  // Carrega vendas em tempo real
  useEffect(() => {

    if (!organizationId) {
      return;
    }

    const salesQuery = query(
      getSalesCollection(
        organizationId
      ),

      orderBy(
        "criadoEm",
        "desc"
      ),

      limit(250)
    );

    const unsubscribe =
      onSnapshot(

        salesQuery,

        (snapshot) => {

          const salesList =
            snapshot.docs.map(
              (doc) => {

                const data =
                  doc.data();

                return {
                  id: doc.id,

                  organizationId:
                    data.organizationId ??
                    organizationId,

                  items:
                    data.items ?? [],

                  subtotal: Number(
                    data.subtotal ??
                    data.valorTotal ??
                    0
                  ),

                  discount: Number(
                    data.discount ??
                    0
                  ),

                  total: Number(
                    data.total ??
                    data.valorTotal ??
                    0
                  ),

                  paymentMethod:
                    data.paymentMethod ??
                    "dinheiro",

                  status:
                    data.status ??
                    "paga",

                  receiptUrl:
                    data.receiptUrl ??
                    "",

                  produtoNome:
                    data.produtoNome ??
                    (
                      data.items ?? []
                    )
                      .map(
                        (
                          item: {
                            productName?: string;
                          }
                        ) =>
                          item.productName
                      )
                      .filter(Boolean)
                      .join(", "),

                  quantidade:
                    Number(
                      data.quantidade ??
                      (
                        data.items ?? []
                      ).reduce(
                        (
                          acc: number,
                          item: {
                            quantity?: number;
                          }
                        ) =>
                          acc +
                          Number(
                            item.quantity ??
                            0
                          ),
                        0
                      )
                    ),

                  valorTotal:
                    Number(
                      data.valorTotal ??
                      data.total ??
                      0
                    ),

                  criadoEm:
                    data.criadoEm,

                  canceladoEm:
                    data.canceladoEm,
                };
              }
            ) as Sale[];

          setSales(
            salesList
          );
        },

        (error) => {

          console.error(
            "ERRO VENDAS:",
            error
          );

          toast.error(
            "Erro ao carregar vendas"
          );
        }
      );

    return () =>
      unsubscribe();

  }, [organizationId]);

  async function handleCancelSale(
    sale: Sale
  ) {

    if (!organizationId) {

      toast.error(
        "Organização não identificada"
      );

      return;
    }

    try {

      setCancelingSaleId(
        sale.id
      );

      await cancelSale(
        organizationId,
        sale.id
      );

      toast.success(
        "Venda cancelada e estoque devolvido"
      );

      setSelectedSale(
        null
      );

    } catch (error) {

      console.log(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao cancelar venda"
      );

    } finally {

      setCancelingSaleId(
        null
      );
    }
  }

  // Filtra vendas
  const filteredSales =
    useMemo(() => {

      return sales.filter(
        (sale) =>
          sale.produtoNome
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

    }, [sales, search]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredSales.length /
        rowsPerPage
      )
    );

  const paginatedSales =
    filteredSales.slice(
      (page - 1) *
      rowsPerPage,

      page * rowsPerPage
    );

  // Total faturado
  const totalRevenue =
    filteredSales.reduce(
      (acc, sale) =>
        acc + sale.valorTotal,
      0
    );

  return (
    <div
      id="sales-history"
      className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950/50 p-6 backdrop-blur-sm"
    >

      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-blue-500/10 p-3">

            <TrendingUp className="h-6 w-6 text-blue-400" />

          </div>

          <div>

            <h2 className="text-3xl font-black">
              Histórico de Vendas
            </h2>

            <p className="mt-1 text-zinc-500">
              Visualize todas as vendas realizadas
            </p>

          </div>

        </div>

        {/* Total */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4">

          <p className="text-sm text-green-400">
            Total Faturado
          </p>

          <strong className="text-2xl font-black text-white">

            {formatCurrency(
              totalRevenue
            )}

          </strong>

        </div>

      </div>

      {/* Pesquisa */}
      <div className="relative mb-6">

        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

        <Input
          type="text"
          placeholder="Pesquisar venda..."
          value={search}
          onChange={(e) => {

            setSearch(
              e.target.value
            );

            setPage(1);
          }}
          className="pl-12"
        />

      </div>

      {/* Tabela */}
      <Table>

        <TableHeader>

          <TableRow>

            <TableCell>
              Produto
            </TableCell>

            <TableCell>
              Quantidade
            </TableCell>

            <TableCell>
              Valor
            </TableCell>

            <TableCell>
              Data
            </TableCell>

            <TableCell>
              Status
            </TableCell>

            <TableCell>
              Ações
            </TableCell>

          </TableRow>

        </TableHeader>

        <tbody>

          {filteredSales.length === 0 ? (

            <tr>

              <td
                colSpan={6}
                className="py-10"
              >

                <EmptyState
                  icon={ShoppingBag}
                  title="Nenhuma venda encontrada"
                  description="As vendas aparecerão aqui"
                />

              </td>

            </tr>

          ) : (

            paginatedSales.map(
              (sale) => (

                <TableRow
                  key={sale.id}
                >

                  {/* Produto */}
                  <TableCell>

                    <strong>
                      {
                        sale.produtoNome
                      }
                    </strong>

                  </TableCell>

                  {/* Quantidade */}
                  <TableCell>

                    {
                      sale.quantidade
                    }

                  </TableCell>

                  {/* Valor */}
                  <TableCell>

                    <span className="font-medium text-green-400">

                      {formatCurrency(
                        sale.valorTotal
                      )}

                    </span>

                  </TableCell>

                  {/* Data */}
                  <TableCell>

                    <span className="text-zinc-400">

                      {formatDate(
                        sale.criadoEm
                          ?.seconds
                      )}

                    </span>

                  </TableCell>

                  {/* Status */}
                  <TableCell>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${sale.status ===
                          "cancelada"
                          ? "border-red-500/20 bg-red-500/10 text-red-400"
                          : sale.status ===
                            "pendente"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border-green-500/20 bg-green-500/10 text-green-400"
                        }`}
                    >

                      {sale.status}

                    </span>

                  </TableCell>

                  {/* Ações */}
                  <TableCell>

                    <Button
                      type="button"
                      variant="secondary"
                      aria-label="Ver detalhes da venda"
                      onClick={() =>
                        setSelectedSale(
                          sale
                        )
                      }
                      className="px-3"
                    >

                      <Eye className="h-4 w-4" />

                    </Button>

                  </TableCell>

                </TableRow>
              )
            )

          )}

        </tbody>

      </Table>

      {/* Paginação */}
      <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">

        <span>
          {
            filteredSales.length
          } venda(s) encontrada(s)
        </span>

        <div className="flex flex-wrap items-center gap-3">

          <select
            value={rowsPerPage}
            onChange={(e) => {

              setRowsPerPage(
                Number(
                  e.target.value
                )
              );

              setPage(1);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none"
          >

            {[5, 10, 20].map(
              (option) => (

                <option
                  key={option}
                  value={option}
                >

                  {option} por página

                </option>
              )
            )}

          </select>

          <Button
            type="button"
            variant="secondary"
            disabled={page === 1}
            onClick={() =>
              setPage(
                (current) =>
                  Math.max(
                    1,
                    current - 1
                  )
              )
            }
          >
            Anterior
          </Button>

          <span>
            Página {page} de {totalPages}
          </span>

          <Button
            type="button"
            variant="secondary"
            disabled={
              page === totalPages
            }
            onClick={() =>
              setPage(
                (current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
              )
            }
          >
            Próxima
          </Button>

        </div>

      </div>

      {/* Modal */}
      <Modal
        open={Boolean(
          selectedSale
        )}
        title="Detalhes da venda"
        description="Resumo financeiro e data de registro"
        onClose={() =>
          setSelectedSale(
            null
          )
        }
      >

        {selectedSale && (

          <div className="grid gap-4 sm:grid-cols-2">

            <Detail
              label="Produto"
              value={
                selectedSale.produtoNome
              }
            />

            <Detail
              label="Itens"
              value={
                selectedSale.items
                  ?.map(
                    (item) =>
                      `${item.quantity}x ${item.productName}`
                  )
                  .join(", ") ||
                selectedSale.produtoNome
              }
            />

            <Detail
              label="Quantidade"
              value={String(
                selectedSale.quantidade
              )}
            />

            <Detail
              label="Subtotal"
              value={formatCurrency(
                selectedSale.subtotal
              )}
            />

            <Detail
              label="Desconto"
              value={formatCurrency(
                selectedSale.discount
              )}
            />

            <Detail
              label="Valor total"
              value={formatCurrency(
                selectedSale.valorTotal
              )}
            />

            <Detail
              label="Pagamento"
              value={
                selectedSale.paymentMethod
              }
            />

            <Detail
              label="Status"
              value={
                selectedSale.status
              }
            />

            <Detail
              label="Data"
              value={formatDate(
                selectedSale.criadoEm
                  ?.seconds
              )}
            />

            {selectedSale.status !==
              "cancelada" && (

                <div className="sm:col-span-2">

                  <Button
                    type="button"
                    variant="danger"
                    disabled={
                      cancelingSaleId ===
                      selectedSale.id
                    }
                    onClick={() =>
                      handleCancelSale(
                        selectedSale
                      )
                    }
                  >

                    {cancelingSaleId ===
                      selectedSale.id
                      ? "Cancelando..."
                      : "Cancelar venda e devolver estoque"}

                  </Button>

                </div>
              )}

          </div>
        )}

      </Modal>

    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">

      <p className="text-xs uppercase text-zinc-500">

        {label}

      </p>

      <p className="mt-1 font-medium text-white">

        {value}

      </p>

    </div>
  );
}