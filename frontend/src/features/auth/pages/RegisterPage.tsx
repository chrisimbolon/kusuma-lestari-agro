// src/features/auth/pages/RegisterPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/axios";

const LOGO_SRC = "/Logo-KLA.png";

const IconUser = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconMail = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEyeOpen = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeClosed = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

const AUTH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:wght@400&family=Instrument+Sans:wght@400;500;600;700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .auth-card { animation: fadeUp 0.45s ease both; }
  .kla-field {
    display:flex; align-items:center; gap:10px;
    border:1.5px solid #e0dbd0; border-radius:10px;
    padding:13px 14px; background:#faf9f7;
    transition:border-color 0.18s,background 0.18s,box-shadow 0.18s; cursor:text;
  }
  .kla-field.focused { border-color:#2d5a1e; background:#fff; box-shadow:0 0 0 3px rgba(45,90,30,0.08); }
  .kla-field.has-error { border-color:#dc2626; box-shadow:0 0 0 3px rgba(220,38,38,0.08); }
  .kla-field input {
    border:none; outline:none; background:transparent;
    font-family:'Instrument Sans',sans-serif; font-size:15px; color:#1a2e1a; flex:1; min-width:0;
  }
  .kla-field input::placeholder { color:#b0a898; }
  .kla-submit {
    width:100%; padding:15px; background:#2d5a1e; color:#fff;
    font-family:'Instrument Sans',sans-serif; font-size:15px; font-weight:700;
    border:none; border-radius:10px; cursor:pointer; letter-spacing:0.02em;
    transition:background 0.18s,transform 0.15s,box-shadow 0.18s;
  }
  .kla-submit:hover:not(:disabled) { background:#1a3a12; transform:translateY(-1px); box-shadow:0 6px 20px rgba(45,90,30,0.25); }
  .kla-submit:disabled { opacity:0.6; cursor:not-allowed; }
  .eye-btn { background:none; border:none; cursor:pointer; color:#9a8f80; padding:2px; line-height:0; transition:color 0.15s; }
  .eye-btn:hover { color:#2d5a1e; }
  .kla-link { color:#2d5a1e; font-weight:600; text-decoration:none; border-bottom:1px solid transparent; transition:border-color 0.15s; }
  .kla-link:hover { border-bottom-color:#2d5a1e; }
`;

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPw, setConfirmPw]       = useState("");
  const [showPw, setShowPw]             = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [focused, setFocused]           = useState<string|null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string|null>(null);
  const [success, setSuccess]           = useState(false);

  const validate = () => {
    if (!fullName.trim()) return "Nama lengkap wajib diisi.";
    if (!email.includes("@")) return "Format email tidak valid.";
    if (password.length < 8) return "Kata sandi minimal 8 karakter.";
    if (password !== confirmPw) return "Konfirmasi kata sandi tidak cocok.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/register/", {
        full_name: fullName,
        email,
        username: email,
        password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (e: any) {
      const msg = e?.response?.data?.detail
        || e?.response?.data?.email?.[0]
        || e?.response?.data?.username?.[0]
        || "Pendaftaran gagal. Silakan coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0ede6", fontFamily:"'Instrument Sans',sans-serif", padding:24 }}>
      <style>{AUTH_STYLES}</style>
      <div className="auth-card" style={{ background:"#fff", borderRadius:20, padding:"44px 40px", width:"100%", maxWidth:440, boxShadow:"0 4px 6px rgba(0,0,0,0.04),0 20px 60px rgba(0,0,0,0.08)" }}>

        {/* Logo + Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:36 }}>
          <div style={{ width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
            <img src={LOGO_SRC} alt="KLA" style={{ width:32, height:32, objectFit:"contain" }} />
          </div>
          <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, fontWeight:400, color:"#1a2e1a", letterSpacing:"-0.01em" }}>Sistem Kusuma Lestari Agro</span>
        </div>

        {/* Title */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:34, fontWeight:400, color:"#1a1a14", margin:"0 0 6px", letterSpacing:"-0.02em" }}>Daftar Akun</h1>
          <p style={{ color:"#9a8f7a", fontSize:14, margin:0 }}>Buat akun baru untuk mengakses sistem</p>
        </div>

        {/* Success state */}
        {success ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
            <p style={{ fontWeight:600, color:"#1a2e1a", fontSize:16, marginBottom:6 }}>Akun berhasil dibuat!</p>
            <p style={{ color:"#9a8f7a", fontSize:14 }}>Mengarahkan ke halaman masuk...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* Nama Lengkap */}
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#2d3a2d", marginBottom:7 }}>Nama Lengkap</label>
              <div className={`kla-field${focused==="name"?" focused":""}`} onClick={() => document.getElementById("kla-name")?.focus()}>
                <span style={{ color:focused==="name"?"#2d5a1e":"#9a8f80", flexShrink:0, lineHeight:0 }}><IconUser /></span>
                <input id="kla-name" type="text" placeholder="Nama lengkap Anda"
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#2d3a2d", marginBottom:7 }}>Email</label>
              <div className={`kla-field${focused==="email"?" focused":""}`} onClick={() => document.getElementById("kla-email")?.focus()}>
                <span style={{ color:focused==="email"?"#2d5a1e":"#9a8f80", flexShrink:0, lineHeight:0 }}><IconMail /></span>
                <input id="kla-email" type="email" placeholder="nama@perusahaan.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
              </div>
            </div>

            {/* Kata Sandi */}
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#2d3a2d", marginBottom:7 }}>Kata Sandi</label>
              <div className={`kla-field${focused==="pw"?" focused":""}`} onClick={() => document.getElementById("kla-pw")?.focus()}>
                <span style={{ color:focused==="pw"?"#2d5a1e":"#9a8f80", flexShrink:0, lineHeight:0 }}><IconLock /></span>
                <input id="kla-pw" type={showPw?"text":"password"} placeholder="Min. 8 karakter"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("pw")} onBlur={() => setFocused(null)} />
                <button type="button" className="eye-btn" onClick={() => setShowPw(p=>!p)} tabIndex={-1}>
                  {showPw ? <IconEyeOpen /> : <IconEyeClosed />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#2d3a2d", marginBottom:7 }}>Konfirmasi Kata Sandi</label>
              <div className={`kla-field${focused==="cpw"?" focused":""}${confirmPw && confirmPw!==password?" has-error":""}`}
                onClick={() => document.getElementById("kla-cpw")?.focus()}>
                <span style={{ color:focused==="cpw"?"#2d5a1e":"#9a8f80", flexShrink:0, lineHeight:0 }}><IconLock /></span>
                <input id="kla-cpw" type={showConfirm?"text":"password"} placeholder="Ulangi kata sandi"
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  onFocus={() => setFocused("cpw")} onBlur={() => setFocused(null)} />
                <button type="button" className="eye-btn" onClick={() => setShowConfirm(p=>!p)} tabIndex={-1}>
                  {showConfirm ? <IconEyeOpen /> : <IconEyeClosed />}
                </button>
              </div>
              {confirmPw && confirmPw !== password && (
                <p style={{ color:"#dc2626", fontSize:12, margin:"4px 0 0" }}>Kata sandi tidak cocok</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p style={{ color:"#dc2626", fontSize:13, margin:"-4px 0 0", display:"flex", alignItems:"center", gap:6 }}>
                ⚠ {error}
              </p>
            )}

            <button type="submit" className="kla-submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? "Membuat akun..." : "Buat Akun"}
            </button>
          </form>
        )}

        <p style={{ textAlign:"center", fontSize:14, color:"#9a8f7a", margin:"24px 0 0" }}>
          Sudah punya akun?{" "}
          <Link to="/login" className="kla-link">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
