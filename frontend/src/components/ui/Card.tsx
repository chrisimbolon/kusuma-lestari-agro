interface Props { children: React.ReactNode; style?: React.CSSProperties; className?: string; }
export default function Card({ children, style }: Props) {
  return <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e8e2d8", overflow:"hidden", ...style }}>{children}</div>;
}
