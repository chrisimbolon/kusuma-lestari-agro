import type { SelectHTMLAttributes } from "react";
import type { SelectOption } from "../../types/common";
interface Props extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; options: SelectOption[]; placeholder?: string; }
export default function Select({ label, error, options, placeholder, style, ...rest }: Props) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:"#1a2e1a" }}>{label}</label>}
      <select {...rest} style={{ padding:"8px 12px", border:`1px solid ${error?"#dc2626":"#d1d5db"}`, borderRadius:7, fontSize:14, color:"#1a2e1a", background:"#fff", ...style }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span style={{ fontSize:11, color:"#dc2626" }}>{error}</span>}
    </div>
  );
}
