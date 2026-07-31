import { HTMLAttributes } from "react";
import clsx from "clsx";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section";
}

export default function Container({
  className,
  children,
  as = "div",
  ...props
}: ContainerProps) {
  const Component = as;
  return (
    <Component
      className={clsx("mx-auto w-full max-w-7xl container-px", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
