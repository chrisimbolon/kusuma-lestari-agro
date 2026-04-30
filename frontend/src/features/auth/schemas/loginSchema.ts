/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/features/auth/schemas/loginSchema.ts             ║
 * ║                                                               ║
 * ║  Single source of truth for all auth form validation.        ║
 * ║  Used by LoginForm + react-hook-form + zodResolver.          ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { z } from "zod";

// ── Login ──────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1,  { message: "Email wajib diisi." })
    .email(  { message: "Format email tidak valid." })
    .transform((v) => v.trim().toLowerCase()),

  password: z
    .string()
    .min(1, { message: "Password wajib diisi." })
    .min(8, { message: "Password minimal 8 karakter." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Register (extend login for future use) ─────────────────────
export const registerSchema = loginSchema
  .extend({
    full_name: z
      .string()
      .min(2, { message: "Nama lengkap minimal 2 karakter." })
      .max(80, { message: "Nama terlalu panjang." })
      .transform((v) => v.trim()),

    confirm_password: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi." }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password tidak cocok.",
    path:    ["confirm_password"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;