import { ReactNode } from "react";
import clsx from "clsx";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "primary" | "dark";
}

const toneStyles: Record<string, string> = {
  default: "bg-black/5 text-ink",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  primary: "bg-primary-light text-primary-hover",
  dark: "bg-dark/70 text-white backdrop-blur-md",
};

export default function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneStyles[tone]
      )}
    >
      {children}
    </span>
  );
}
