interface SkeletonProps {
    className?: string;
  }
  
  export function Skeleton({
    className = "",
  }: SkeletonProps) {
  
    return (
      <div
        className={`
          animate-pulse
          rounded-xl
          bg-zinc-800
          ${className}
        `}
      />
    );
  }