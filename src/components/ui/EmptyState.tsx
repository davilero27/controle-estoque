import type {
  LucideIcon,
} from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;

  title: string;

  description: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

      {/* Ícone */}
      <div className="mb-4 rounded-2xl bg-zinc-800 p-4">

        <Icon className="h-8 w-8 text-zinc-400" />

      </div>

      {/* Título */}
      <h3 className="text-xl font-bold text-white">

        {title}

      </h3>

      {/* Descrição */}
      <p className="mt-2 max-w-sm text-zinc-500">

        {description}

      </p>

    </div>
  );
}