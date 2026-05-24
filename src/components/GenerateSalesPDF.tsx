"use client";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import {
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { useAuth } from "@/contexts/AuthContext";

import { getSalesCollection } from "@/services/sales";

import type { Sale } from "@/lib/types";
import {
  getSaleProductName,
  getSaleQuantity,
  getSaleTotal,
} from "@/lib/types";

import { toast } from "sonner";

type JsPDFWithLastAutoTable =
  jsPDF & {
    lastAutoTable: {
      finalY: number;
    };
  };

function buildSaleRow(data: Sale): string[] {
  return [
    getSaleProductName(data),
    String(getSaleQuantity(data)),
    `R$ ${getSaleTotal(data).toFixed(2)}`,
  ];
}

export function GenerateSalesPDF() {
  const { organizationId } = useAuth();

  async function handleGeneratePDF() {
    if (!organizationId) {
      toast.error("Organização não identificada");
      return;
    }

    try {
      const salesQuery = query(
        getSalesCollection(organizationId),
        orderBy("criadoEm", "desc")
      );

      const snapshot = await getDocs(salesQuery);

      const rawSales = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sale[];

      // Excluir canceladas do relatório
      const activeSales = rawSales.filter(
        (s) => s.status !== "cancelada"
      );

      const rows = activeSales.map(buildSaleRow);

      const total = activeSales.reduce(
        (acc, sale) => acc + getSaleTotal(sale),
        0
      );

      const pdf = new jsPDF();

      pdf.setFontSize(18);
      pdf.text("Relatório de Vendas", 14, 20);

      autoTable(pdf, {
        startY: 30,
        head: [["Produto", "Quantidade", "Valor"]],
        body: rows,
      });

      const docWithTable = pdf as JsPDFWithLastAutoTable;
      const afterTableY =
        docWithTable.lastAutoTable.finalY + 15;

      docWithTable.text(
        `Faturamento Total: R$ ${total.toFixed(2)}`,
        14,
        afterTableY
      );

      pdf.save("relatorio-vendas.pdf");

      toast.success("Relatório gerado com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF");
    }
  }

  return (
    <button
      type="button"
      onClick={handleGeneratePDF}
      className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-xl mt-6"
    >
      Gerar Relatório PDF
    </button>
  );
}