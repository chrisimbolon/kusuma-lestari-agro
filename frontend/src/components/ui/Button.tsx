import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?:    "sm" | "md" | "lg";
  loading?: boolean;
}

const styles: Record<Variant, React.CSSProperties> = {
  primary:   { background:"#1a3a12", color:"#fff",    border:"none" },
  secondary: { background:"transparent", color:"#1a3a12", border:"1px solid #1a3a12" },
  danger:    { background:"#dc2626", color:"#fff",    border:"none" },
  ghost:     { background:"transparent", color:"#7a9a7a", border:"1px solid #e5e7eb" },
};

const sizes = { sm:"6px 12px", md:"8px 16px", lg:"10px 24px" };

export default function Button({
  variant = "primary",
  size    = "md",
  loading,
  children,
  disabled,
  style,
  type = "button",   // ✅ default to "button" — never accidentally submit a form
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        padding: sizes[size],
        borderRadius: 7,
        fontFamily: "'Instrument Sans',sans-serif",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        opacity: (disabled || loading) ? 0.6 : 1,
        transition: "all 0.13s",
        ...style,
      }}
    >
      {loading
        ? <span style={{
            width: 12, height: 12,
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "kla-spin 0.7s linear infinite",
            display: "inline-block",
          }} />
        : null}
      {children}
    </button>
  );
}
