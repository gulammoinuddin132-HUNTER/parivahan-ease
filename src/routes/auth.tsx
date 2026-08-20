import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Parivahan Sewa 2.0" },
      {
        name: "description",
        content:
          "Sign in or create a Parivahan Sewa 2.0 account to submit applications and track their status from one dashboard.",
      },
      { property: "og:title", content: "Sign in — Parivahan Sewa 2.0" },
      {
        property: "og:description",
        content: "Secure email or Google sign-in for the Parivahan Sewa 2.0 citizen dashboard.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void navigate({ to: "/dashboard" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) void navigate({ to: "/dashboard" });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (signUpError) throw signUpError;
        setNotice("Account created. Check your inbox to confirm your email, then sign in.");
        setMode("signin");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in could not be completed. Please try email instead.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard" });
  }

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-14">
      <h1 className="text-2xl font-semibold">
        {mode === "signin" ? "Sign in to your account" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One account for every transport service — your profile, applications and status timeline stay
        in one place.
      </p>

      <div className="surface-card mt-8 p-5">
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 text-sm font-semibold disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or use your email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {mode === "signup" && (
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium">
                Full name
              </label>
              <input
                id="full-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="tap-target mt-1 w-full rounded-xl border border-input bg-background px-4 text-base"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tap-target mt-1 w-full rounded-xl border border-input bg-background px-4 text-base"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tap-target mt-1 w-full rounded-xl border border-input bg-background px-4 text-base"
              aria-describedby="password-help"
            />
            <p id="password-help" className="mt-1 text-xs text-muted-foreground">
              At least 6 characters.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-xl bg-accent p-3 text-sm text-accent-foreground">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="tap-target w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          {mode === "signin" ? "New to Parivahan Sewa 2.0?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="font-semibold text-primary underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
      </div>
    </section>
  );
}
