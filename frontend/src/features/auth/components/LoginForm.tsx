/**
 * src/features/auth/components/LoginForm.tsx
 *
 * Fixes:
 * 1. login is an async fn — NOT a mutation object.
 *    Removed login.mutate(), login.error, login.isPending
 * 2. Field: username → email (matches Django backend)
 * 3. Local isPending + error state via useState
 *
 * Note: LoginPage.tsx already has a full polished login UI.
 * This component is kept for any embedded usage.
 */

import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAuth } from "../hooks/useAuth";

export default function LoginForm() {
  const { login } = useAuth();

  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      // login is an async function — not a mutation object
      await login({ email: email.trim().toLowerCase(), password });
    } catch {
      setError("Email atau password salah.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {error && (
        <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>
      )}
      <Button
        type="submit"
        loading={isPending}
        style={{ width: "100%", justifyContent: "center" }}
      >
        Masuk
      </Button>
    </form>
  );
}
