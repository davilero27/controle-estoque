type InputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

export function Input({
  className = "",
  ...props
}: InputProps) {

  return (
    <input
      className={`
        w-full
        bg-zinc-900
        border
        border-zinc-800
        px-4
        py-3
        rounded-xl
        outline-none
        transition
        focus:border-blue-500
        ${className}
      `}
      {...props}
    />
  );
}
