"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ErrorMessage } from "@/components/ErrorMessage";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const missingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const queryError = searchParams.get("error");
  const rawCallbackUrl = searchParams.get("callbackUrl") ?? searchParams.get("redirectedFrom") ?? "";
  const callbackUrl = rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//") ? rawCallbackUrl : "";
  const registerHref = callbackUrl ? `/registro?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/registro";
  const querySuccess = searchParams.get("success");
  const queryErrorMessage =
    queryError === "unauthorized"
      ? "Tu usuario no tiene permisos para ingresar al panel de gestión."
      : queryError === "missing-env"
        ? "El panel de gestión todavía no tiene conectadas las credenciales de servicio."
	        : "";
  const querySuccessMessage = querySuccess === "registered" ? "Cuenta creada correctamente. Ya podés ingresar con tu email y contraseña." : "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (missingConfig) {
      setError("Configurá las credenciales del servicio antes de iniciar sesión.");
      return;
    }

    setPending(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setPending(false);

    if (authError) {
      setError("No se pudo iniciar sesión. Revisá el email y la contraseña.");
      return;
    }

    router.push(callbackUrl || "/mis-reservas");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-black/8 bg-white p-6 shadow-soft">
      <label className="space-y-2">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input
          className="focus-ring w-full rounded-xl border border-black/10 px-4 py-3 text-sm shadow-sm"
          type="email"
          placeholder="equipo@clubdeportivonorte.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-ink">Contraseña</span>
        <input
          className="focus-ring w-full rounded-xl border border-black/10 px-4 py-3 text-sm shadow-sm"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {querySuccessMessage ? (
        <div className="rounded-xl border border-field-100 bg-field-50 px-4 py-3 text-sm font-semibold text-field-700">{querySuccessMessage}</div>
      ) : null}
      {error || queryErrorMessage ? (
        <ErrorMessage>{error || queryErrorMessage}</ErrorMessage>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-field-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-field-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn size={18} />
        {pending ? "Entrando..." : "Ingresar"}
      </button>
      <p className="text-center text-sm text-ink/58">
        ¿Todavía no tenés cuenta?{" "}
        <Link href={registerHref} className="font-semibold text-field-700 hover:text-field-800">
          Registrate
        </Link>
      </p>
    </form>
  );
}
