interface Props { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean; }
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger }: Props) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#fff", borderRadius:12, padding:24, maxWidth:400, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin:"0 0 8px", color:"#1a2e1a", fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>{title}</h3>
        <p style={{ margin:"0 0 20px", color:"#7a9a7a", fontSize:14 }}>{message}</p>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ padding:"8px 16px", border:"1px solid #ddd", borderRadius:7, background:"transparent", cursor:"pointer" }}>Batal</button>
          <button onClick={onConfirm} style={{ padding:"8px 16px", border:"none", borderRadius:7, background:danger?"#dc2626":"#1a3a12", color:"#fff", cursor:"pointer", fontWeight:600 }}>Konfirmasi</button>
        </div>
      </div>
    </div>
  );
}
