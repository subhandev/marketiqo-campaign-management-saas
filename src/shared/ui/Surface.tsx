import { cn } from "@/lib/utils";

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
  overflow?: boolean;
}

export function Surface({ children, className, overflow = false }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm",
        overflow && "overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
