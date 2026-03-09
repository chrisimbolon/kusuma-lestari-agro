type Color = "green"|"yellow"|"red"|"blue"|"gray"|"orange";
const COLORS: Record<Color, { bg:string; color:string; border:string }> = {
  green:  { bg:"#dcfce7", color:"#166534", border:"#bbf7d0" },
  yellow: { bg:"#fef9c3", color:"#854d0e", border:"#fde68a" },
  red:    { bg:"#fee2e2", color:"#991b1b", border:"#fecaca" },
  blue:   { bg:"#dbeafe", color:"#1e40af", border:"#bfdbfe" },
  gray:   { bg:"#f3f4f6", color:"#374151", border:"#e5e7eb" },
  orange: { bg:"#ffedd5", color:"#9a3412", border:"#fed7aa" },
};
interface Props { label: string; color?: Color; }
export default function Badge({ label, color="gray" }: Props) {
  const c = COLORS[color];
  return <span style={{ ...c, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, border:`1px solid ${c.border}`, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.04em", whiteSpace:"nowrap" }}>{label}</span>;
}
