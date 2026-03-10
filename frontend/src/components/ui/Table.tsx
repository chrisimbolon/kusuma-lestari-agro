interface Column<T> { key: string; header: string; render?: (row: T) => React.ReactNode; align?: "left"|"right"|"center"; width?: string; }
interface Props<T> { columns: Column<T>[]; data: T[]; rowKey: (row: T) => string; onRowClick?: (row: T) => void; loading?: boolean; emptyMessage?: string; }
export default function Table<T>({ columns, data, rowKey, onRowClick, loading, emptyMessage="Tidak ada data" }: Props<T>) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, fontFamily:"'Instrument Sans',sans-serif" }}>
        <thead>
          <tr style={{ borderBottom:"2px solid #e8e2d8", background:"#f9f7f3" }}>
            {columns.map(c => <th key={c.key} style={{ padding:"10px 14px", textAlign:c.align??"left", fontWeight:600, color:"#4a6a4a", fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap", width:c.width }}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} style={{ textAlign:"center", padding:32, color:"#9ca3af" }}>Memuat...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ textAlign:"center", padding:32, color:"#9ca3af" }}>{emptyMessage}</td></tr>
          ) : data.map(row => (
            <tr key={rowKey(row)} onClick={()=>onRowClick?.(row)} style={{ borderBottom:"1px solid #f0ebe0", cursor:onRowClick?"pointer":undefined, transition:"background 0.1s" }}
              onMouseEnter={e=>{if(onRowClick)(e.currentTarget as HTMLElement).style.background="#f9f7f3"}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=""}}>
              {columns.map(c => <td key={c.key} style={{ padding:"10px 14px", textAlign:c.align??"left", color:"#1a2e1a" }}>{c.render ? c.render(row) : (row as any)[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
