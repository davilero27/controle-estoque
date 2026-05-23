interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {

  children: React.ReactNode;

  variant?:
    | "primary"
    | "danger"
    | "success"
    | "secondary";
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {

  const variants = {
    primary:
      "bg-blue-500 hover:bg-blue-600 text-white",

    danger:
      "bg-red-500 hover:bg-red-600 text-white",

    success:
      "bg-green-500 hover:bg-green-600 text-white",

    secondary:
      "border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800",
  };

  return (
    <button
      className={`
        px-4
        py-3
        rounded-xl
        font-medium
        transition
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
