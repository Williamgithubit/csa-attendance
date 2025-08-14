import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = `px-4 py-2 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`;

    const variantStyles =
      variant === "default"
        ? "bg-brand text-white border border-brand hover:bg-brand/90"
        : variant === "outline"
        ? "bg-white text-brand border border-brand hover:bg-brand/5"
        : "bg-transparent text-gray-700 hover:bg-gray-100";

    const sizeStyles =
      size === "sm"
        ? "text-sm px-3 py-1.5"
        : size === "lg"
        ? "text-lg px-5 py-3"
        : "text-base";

    const inlineStyle: React.CSSProperties = {};
    if (variant === "default") {
      inlineStyle.backgroundColor = "var(--color-brand, #DC3C22)";
      inlineStyle.borderColor = "var(--color-brand, #DC3C22)";
    } else if (variant === "outline") {
      inlineStyle.borderColor = "var(--color-brand, #DC3C22)";
      inlineStyle.color = "var(--color-brand, #DC3C22)";
    }

    return (
      <button
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${
          className || ""
        }`}
        style={inlineStyle}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
