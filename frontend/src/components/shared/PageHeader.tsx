interface Props { title: string; subtitle?: string; actions?: React.ReactNode; }
export default function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16 }}>
      <div>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, fontWeight:400, color:"#1a2e1a", margin:0 }}>{title}</h1>
        {subtitle && <p style={{ color:"#7a9a7a", fontSize:14, marginTop:4, margin:0 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display:"flex", gap:8, flexShrink:0 }}>{actions}</div>}
    </div>
  );
}
