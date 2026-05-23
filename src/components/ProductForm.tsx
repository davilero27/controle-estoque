"use client";

import { useMemo, useState } from "react";

import {
  createProduct,
  updateProduct,
} from "@/services/products";

import type { Product } from "@/lib/types";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";

import { useAuth } from "@/contexts/AuthContext";

import { uploadProductImage } from "@/services/storage";

import {
  getValidationMessage,
  productSchema,
} from "@/lib/validation";

import { toast } from "sonner";

interface ProductFormProps {
  editingProduct?: Product | null;
  onFinishEdit?: () => void;
  onProductCreated?: () => void;
}

function generateSku(nome: string) {
  const prefix = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "SKU");

  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export function ProductForm({
  editingProduct,
  onFinishEdit,
  onProductCreated,
}: ProductFormProps) {
  const { organizationId } = useAuth();

  const initialValues = useMemo(
    () => ({
      nome: editingProduct?.nome ?? "",
      preco: editingProduct
        ? String(editingProduct.preco)
        : "",
      estoque: editingProduct
        ? String(editingProduct.estoque)
        : "",
      categoria: editingProduct?.categoria ?? "",
      sku: editingProduct?.sku ?? "",
      codigoBarras:
        editingProduct?.codigoBarras ?? "",
      estoqueMinimo: editingProduct?.estoqueMinimo
        ? String(editingProduct.estoqueMinimo)
        : "",
      fornecedor: editingProduct?.fornecedor ?? "",
      imageUrl: editingProduct?.imageUrl ?? "",
    }),
    [editingProduct]
  );

  const [nome, setNome] =
    useState(initialValues.nome);
  const [preco, setPreco] =
    useState(initialValues.preco);
  const [estoque, setEstoque] =
    useState(initialValues.estoque);
  const [categoria, setCategoria] =
    useState(initialValues.categoria);
  const [sku, setSku] =
    useState(initialValues.sku);
  const [codigoBarras, setCodigoBarras] =
    useState(initialValues.codigoBarras);
  const [estoqueMinimo, setEstoqueMinimo] =
    useState(initialValues.estoqueMinimo);
  const [fornecedor, setFornecedor] =
    useState(initialValues.fornecedor);
  const [imageUrl, setImageUrl] =
    useState(initialValues.imageUrl);
  const [imageFile, setImageFile] =
    useState<File | null>(null);
  const [saving, setSaving] =
    useState(false);

  function resetForm() {
    setNome("");
    setPreco("");
    setEstoque("");
    setCategoria("");
    setSku("");
    setCodigoBarras("");
    setEstoqueMinimo("");
    setFornecedor("");
    setImageUrl("");
    setImageFile(null);
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  }

  async function handleCreateProduct() {
    if (!organizationId) {
      toast.error("Organização não identificada");
      return;
    }

    if (!nome || !preco || !estoque) {
      toast.info("Preencha nome, preço e estoque");
      return;
    }

    const numericPrice = Number(preco);
    const numericStock = Number(estoque);
    const numericMinimumStock = Number(
      estoqueMinimo || 0
    );

    const validation = productSchema.safeParse({
      nome,
      preco: numericPrice,
      estoque: numericStock,
      categoria,
      sku,
      codigoBarras,
      estoqueMinimo: numericMinimumStock,
      fornecedor,
      imageUrl: editingProduct?.imageUrl ?? "",
    });

    if (!validation.success) {
      toast.error(getValidationMessage(validation.error));
      return;
    }

    try {
      setSaving(true);

      const productPayload = {
        nome,
        preco: numericPrice,
        estoque: numericStock,
        categoria,
        sku: sku || generateSku(nome),
        codigoBarras,
        estoqueMinimo: numericMinimumStock,
        fornecedor,
        imageUrl:
          editingProduct?.imageUrl && !imageFile
            ? editingProduct.imageUrl
            : "",
      };

      if (editingProduct) {
        await updateProduct(
          organizationId,
          editingProduct.id,
          productPayload
        );

        if (imageFile) {
          const uploadedImageUrl =
            await uploadProductImage({
              organizationId,
              productId: editingProduct.id,
              file: imageFile,
            });

          await updateProduct(
            organizationId,
            editingProduct.id,
            {
              imageUrl: uploadedImageUrl,
            }
          );
        }

        toast.success("Produto atualizado");
        onFinishEdit?.();
      } else {
        const createdProduct = await createProduct(
          organizationId,
          productPayload
        );

        if (imageFile) {
          const uploadedImageUrl =
            await uploadProductImage({
              organizationId,
              productId: createdProduct.id,
              file: imageFile,
            });

          await updateProduct(
            organizationId,
            createdProduct.id,
            {
              imageUrl: uploadedImageUrl,
            }
          );
        }

        toast.success("Produto criado com sucesso");
        onProductCreated?.();
        resetForm();
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      id="product-form"
      className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {editingProduct
            ? "Editar Produto"
            : "Novo Produto"}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Cadastre dados comerciais, estoque e identificação.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[160px_1fr]">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Imagem
          </label>

          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-900">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={nome || "Imagem do produto"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="px-4 text-center text-xs text-zinc-500">
                Sem imagem
              </span>
            )}
          </div>

          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-200"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-zinc-400">
              Nome do Produto
            </label>
            <Input
              type="text"
              placeholder="Nome do produto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Preço
            </label>
            <Input
              type="number"
              placeholder="0,00"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Estoque
            </label>
            <Input
              type="number"
              placeholder="Quantidade em estoque"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Categoria
            </label>
            <Input
              type="text"
              placeholder="Ex: Eletrônicos"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              SKU
            </label>
            <Input
              type="text"
              placeholder="Gerado automaticamente se vazio"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Código de barras
            </label>
            <Input
              type="text"
              placeholder="EAN, UPC ou interno"
              value={codigoBarras}
              onChange={(e) =>
                setCodigoBarras(e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Estoque mínimo
            </label>
            <Input
              type="number"
              placeholder="5"
              value={estoqueMinimo}
              onChange={(e) =>
                setEstoqueMinimo(e.target.value)
              }
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-zinc-400">
              Fornecedor
            </label>
            <Input
              type="text"
              placeholder="Fornecedor principal"
              value={fornecedor}
              onChange={(e) =>
                setFornecedor(e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {editingProduct && (
          <Button
            type="button"
            variant="secondary"
            onClick={onFinishEdit}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="button"
          onClick={handleCreateProduct}
          disabled={saving}
        >
          {saving
            ? "Salvando..."
            : editingProduct
              ? "Salvar Alterações"
              : "Salvar Produto"}
        </Button>
      </div>
    </div>
  );
}
