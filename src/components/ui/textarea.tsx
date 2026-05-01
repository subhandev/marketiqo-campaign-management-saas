import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[100px] w-full rounded-lg border border-input bg-muted/50 px-3 py-2.5 text-sm transition-colors outline-none",
        "placeholder:text-muted-foreground/50",
        "hover:bg-muted/70",
        "focus-visible:bg-background focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
