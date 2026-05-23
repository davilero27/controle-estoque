import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  iconClassName: string;
}

export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  iconClassName,
}: StatCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-zinc-400">{title}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p className="mt-2 text-xs text-zinc-500">{trend}</p>
        )}
      </div>
    </div>
  );
}
