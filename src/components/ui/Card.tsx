interface CardProps {
    children: React.ReactNode;
  
    className?: string;
  }
  
  export function Card({
    children,
    className = "",
  }: CardProps) {
  
    return (
      <div
        className={`
          bg-zinc-900/80
          border
          border-zinc-800
          rounded-xl
          p-5
          ${className}
        `}
      >
        {children}
      </div>
    );
  }