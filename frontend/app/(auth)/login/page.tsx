"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="mb-6 text-center">
        <p className="text-xs uppercase tracking-widest text-brand-500">RBAC Login</p>
        <h2 className="text-2xl font-semibold text-slate-900">Access MediTrack AI</h2>
        <p className="mt-2 text-sm text-slate-600">
          Patients, Doctors, and Admins authenticate via Supabase Auth. Roles map to
          RLS policies that the FastAPI backend verifies on each request.
        </p>
      </header>

      <Auth
        supabaseClient={supabase}
        providers={[]}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#4f46e5",
                brandAccent: "#4338ca"
              }
            }
          }
        }}
      />
    </section>
  );
}

