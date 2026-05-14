"use client";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firestore";

type JsPDFWithLastAutoTable =
  jsPDF & {
    lastAutoTable: {
      finalY: number;
    };
  };

export function GenerateSalesPDF() {
  async function handleGeneratePDF() {
    try {
      const snapshot =
        await getDocs(
          collection(
            db,
            "vendas"
          )
        );

      const sales =
        snapshot.docs.map((doc) => {
          const data =
            doc.data();

          return [
            data.produtoNome,
            data.quantidade,
            `R$ ${Number(
              data.valorTotal || 0
            ).toFixed(2)}`,
          ];
        });

      const total =
        snapshot.docs.reduce(
          (acc, doc) => {
            const data =
              doc.data();

            return (
              acc +
              Number(
                data.valorTotal || 0
              )
            );
          },
          0
        );

      const pdf =
        new jsPDF();

      pdf.setFontSize(18);

      pdf.text(
        "Relatório de Vendas",
        14,
        20
      );

      autoTable(pdf, {
        startY: 30,

        head: [
          [
            "Produto",
            "Quantidade",
            "Valor",
          ],
        ],

        body: sales,
      });

      const docWithTable =
        pdf as JsPDFWithLastAutoTable;

      const afterTableY =
        docWithTable.lastAutoTable
          .finalY + 15;

      docWithTable.text(
        `Faturamento Total: R$ ${total.toFixed(
          2
        )}`,
        14,
        afterTableY
      );

      pdf.save(
        "relatorio-vendas.pdf"
      );
    } catch (error) {
      console.log(error);

      alert(
        "Erro ao gerar PDF"
      );
    }
  }

  return (
    <button
      type="button"
      onClick={
        handleGeneratePDF
      }
      className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-xl mt-6"
    >
      Gerar Relatório PDF
    </button>
  );
}