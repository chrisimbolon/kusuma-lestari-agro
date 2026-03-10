import type { InputHTMLAttributes } from "react";
interface Props extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
export default function Input({ label, error, style, ...rest }: Props) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:"#1a2e1a", fontFamily:"'Instrument Sans',sans-serif" }}>{label}</label>}
      <input {...rest} style={{ padding:"8px 12px", border:`1px solid ${error?"#dc2626":"#d1d5db"}`, borderRadius:7, fontSize:14, fontFamily:"'Instrument Sans',sans-serif", color:"#1a2e1a", outline:"none", width:"100%", ...style }} />
      {error && <span style={{ fontSize:11, color:"#dc2626" }}>{error}</span>}
    </div>
  );
}
