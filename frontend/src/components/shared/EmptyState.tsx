interface Props { icon?: string; title: string; description?: string; action?: React.ReactNode; }
export default function EmptyState({ icon="📭", title, description, action }: Props) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px", color:"#7a9a7a" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <h3 style={{ color:"#1a2e1a", marginBottom:6, fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>{title}</h3>
      {description && <p style={{ fontSize:14, marginBottom:16 }}>{description}</p>}
      {action}
    </div>
  );
}
