"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") ?? "";
  const callbackUrl = rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//") ? rawCallbackUrl : "";
  const loginHref = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const missingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (missingConfig) {
      setError("El registro todavía no tiene conectadas las credenciales del servicio.");
      return;
    }

    if (fullName.trim().length < 3) {
      setError("Ingresá tu nombre completo.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (phone && phone.replace(/[^\d]/g, "").length < 8) {
      setError("Ingresá un teléfono válido o dejá el campo vacío.");
      return;
    }

    setPending(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: "user"
        }
      }
    });

    if (signUpError) {
      setPending(false);
      setError("No pudimos crear la cuenta. Revisá los datos e intentá nuevamente.");
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        role: "user"
      });
    }

    setPending(false);

    if (data.session) {
      router.push(callbackUrl || "/mis-reservas");
      router.refresh();
      return;
    }

    setSuccess("Cuenta creada correctamente. Revisá tu email si Supabase solicita confirmación y luego ingresá para continuar.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-black/8 bg-white p-6 shadow-soft">
      <label className="space-y-2">
        <span className="text-sm font-semibold text-ink">Nombre completo</span>
        <input
          className="focus-ring w-full rounded-xl border border-black/10 px-4 py-3 text-sm shadow-sm"
          placeholder="Nombre y apellido"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          required
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input
          className="focus-ring w-full rounded-xl border border-black/10 px-4 py-3 text-sm shadow-sm"
          type="email"
          placeholder="nombre@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-ink">Teléfono</span>
        <input
          className="focus-ring w-full rounded-xl border border-black/10 px-4 py-3 text-sm shadow-sm"
          placeholder="+54 9 11 2345-6789"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-ink">Contraseña</span>
        <input
          className="focus-ring w-full rounded-xl border border-black/10 px-4 py-3 text-sm shadow-sm"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
          minLength={6}
        />
      </label>

      {success ? <div className="rounded-xl border border-field-100 bg-field-50 px-4 py-3 text-sm font-semibold text-field-700">{success}</div> : null}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}

      <button
        type="submit"
        disabled={pending}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-field-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-field-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus size={18} />
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-ink/58">
        ¿Ya tenés cuenta?{" "}
        <Link href={loginHref} className="font-semibold text-field-700 hover:text-field-800">
          Ingresá
        </Link>
      </p>
    </form>
  );
}
