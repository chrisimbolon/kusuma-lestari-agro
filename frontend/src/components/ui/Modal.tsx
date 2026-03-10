interface Props { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number; }
export default function Modal({ open, onClose, title, children, width=600 }: Props) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:12, width:"100%", maxWidth:width, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:"1px solid #e8e2d8" }}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontWeight:400, color:"#1a2e1a", margin:0, fontSize:18 }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#7a9a7a" }}>×</button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}
