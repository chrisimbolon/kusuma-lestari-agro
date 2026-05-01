import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header style={{ borderBottom: "1px solid #ccc", padding: "12px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>

        <div style={{ fontWeight: "bold" }}>
          Kusuma Lestari Agro
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <Link to="/">Produk Organik</Link>
          <Link to="/">Tentang Kami</Link>
          <Link to="/">Distributor</Link>
          <Link to="/gallery" style={{ color: "red", fontWeight: "bold" }}>
            Gallery
          </Link>
        </div>

      </div>
    </header>
  );
}