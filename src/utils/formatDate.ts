import { parseFirestoreDate } from "@/utils/parseFirestoreDate";

export function formatDate(
  value?: Date | number | unknown
) {
  const date =
    value instanceof Date
      ? value
      : typeof value === "number"
        ? new Date(value * 1000)
        : parseFirestoreDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
