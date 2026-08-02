import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "info"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-[#4F46E5] text-white",
      secondary: "bg-[#E5E7EB] text-[#111827]",
      success: "bg-[#ECFDF5] text-[#10B981]",
      warning: "bg-[#FFFBEB] text-[#F59E0B]",
      danger: "bg-[#FEE2E2] text-[#EF4444]",
      info: "bg-[#DBEAFE] text-[#3B82F6]",
    }

    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
