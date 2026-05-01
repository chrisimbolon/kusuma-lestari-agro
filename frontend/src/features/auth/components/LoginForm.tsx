//src/features/auth/components/LoginForm.tsx
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAuth } from "../hooks/useAuth";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); 
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); login.mutate({ username, password }); };
  return (
    <form onSubmit={onSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Input label="Username" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" />
      <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" />
      {login.error && <p style={{ color:"#dc2626", fontSize:13, margin:0 }}>Username atau password salah.</p>}
      <Button type="submit" loading={login.isPending} style={{ width:"100%", justifyContent:"center" }}>Masuk</Button>
    </form>
  );
}
