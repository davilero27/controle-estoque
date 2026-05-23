interface SectionTitleProps {
  title: string;
  description?: string;
}

export function SectionTitle({
  title,
  description,
}: SectionTitleProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white md:text-3xl">
        {title}
      </h1>

      {description && (
        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>
      )}
    </div>
  );
}
