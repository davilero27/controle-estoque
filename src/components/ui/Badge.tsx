interface BadgeProps {
    children: React.ReactNode;
  
    variant?:
      | "primary"
      | "danger"
      | "success";
  
    className?: string;
  }
  
  export function Badge({
    children,
    variant = "primary",
    className = "",
  }: BadgeProps) {
  
    const variants = {
      primary:
        "bg-blue-500/10 text-blue-400 border-blue-500/20",
  
      danger:
        "bg-red-500/10 text-red-400 border-red-500/20",
  
      success:
        "bg-green-500/10 text-green-400 border-green-500/20",
    };
  
    return (
      <span
        className={`
          inline-flex
          items-center
          px-3
          py-1
          rounded-full
          text-xs
          font-semibold
          border
          ${variants[variant]}
          ${className}
        `}
      >
        {children}
      </span>
    );
  }