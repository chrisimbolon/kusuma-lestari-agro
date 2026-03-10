import { Component } from "react";
interface State { hasError: boolean; }
export default class ErrorBoundary extends Component<{ children: React.ReactNode }, State> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding:40, textAlign:"center" }}>
        <h2 style={{ fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>Terjadi Kesalahan</h2>
        <p style={{ color:"#7a9a7a" }}>Mohon muat ulang halaman.</p>
        <button onClick={() => window.location.reload()} style={{ padding:"8px 20px", background:"#1a3a12", color:"#fff", border:"none", borderRadius:7, cursor:"pointer" }}>Muat Ulang</button>
      </div>
    );
    return this.props.children;
  }
}
