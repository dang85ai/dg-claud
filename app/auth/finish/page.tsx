"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { supabase } from "@/lib/supabase";

type Mode = "checking" | "ready" | "complete" | "error";

export default function CompleteInvitation() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("checking");
  const [status, setStatus] = useState("Verifying your private team invitation…");
  const [busy, setBusy] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const url = new URL(window.location.href);
        const hash = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
        const tokenHash = hash.get("token_hash") || url.searchParams.get("token_hash");
        const rawType = hash.get("type") || url.searchParams.get("type") || "invite";
        const code = url.searchParams.get("code");

        // Keep single-use credentials out of visible history after reading them.
        if (tokenHash || code) window.history.replaceState(window.history.state, "", "/auth/finish");

        let authError: Error | null = null;
        if (tokenHash) {
          // Never accept arbitrary OTP types from URL parameters.
          if (rawType !== "invite" && rawType !== "recovery") throw new Error("Unsupported invitation type.");
          const verified = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: rawType });
          authError = verified.error;
        } else if (code) {
          const exchanged = await supabase.auth.exchangeCodeForSession(code);
          authError = exchanged.error;
        } else if (hash.get("error_description")) {
          throw new Error("This activation link is invalid or has expired. Ask the team manager for a new invitation.");
        }
        if (authError) throw new Error("This activation link could not be verified. It may have expired or already been used.");
        const session = await supabase.auth.getSession();
        if (!session.data.session?.user) throw new Error("No valid invitation session found. Open your original invitation link again.");
        if (!active) return;
        setAccountEmail(session.data.session.user.email || "");
        setMode("ready");
        setStatus("");
      } catch (error) {
        if (!active) return;
        setMode("error");
        setStatus(error instanceof Error ? error.message : "Unable to activate your account.");
      }
    })();
    return () => { active = false; };
  }, []);

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (password.length < 12) { setStatus("Use a password with at least 12 characters."); return; }
    if (password !== confirm) { setStatus("Passwords do not match."); return; }
    setBusy(true); setStatus("");
    try {
      const updated = await supabase.auth.updateUser({ password });
      if (updated.error) throw updated.error;
      setMode("complete");
      setStatus("Your password is set. You can now access your private team portal.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to set password.");
    } finally { setBusy(false); }
  }

  return (
    <AuthShell eyebrow="Secure Team Invitation" title="Complete Account Setup">
      {mode === "checking" ? <div className="notice">{status}</div> : null}
      {mode === "error" ? <div className="space-y-4">
        <div className="notice" role="alert">{status}</div>
        <p className="text-sm text-neutral-600">For your privacy, only the person who received the invitation should use this link.</p>
        <Link href="/login" className="btn btn-light">Back to Sign In</Link>
      </div> : null}
      {mode === "ready" ? <>
        <p className="text-sm text-neutral-600">Your invitation has been verified{accountEmail ? " for " + accountEmail : ""}. Create your private portal password below.</p>
        <form className="mt-6 grid gap-4" onSubmit={savePassword}>
          <label><span className="field-label">New password</span><input className="field" type="password" name="password" autoComplete="new-password" minLength={12} required /></label>
          <label><span className="field-label">Confirm password</span><input className="field" type="password" name="confirm" autoComplete="new-password" minLength={12} required /></label>
          <button disabled={busy} className="btn btn-primary">{busy ? "Saving…" : "Activate Team Account"}</button>
        </form>
        {status ? <div className="notice mt-4" role="status">{status}</div> : null}
      </> : null}
      {mode === "complete" ? <>
        <div className="notice" role="status">{status}</div>
        <button className="btn btn-primary mt-5 w-full" onClick={() => router.replace("/portal")}>Open My Team Portal</button>
        <p className="mt-4 text-xs text-neutral-500">Team managers and administrators must verify multi-factor authentication before using management tools.</p>
      </> : null}
    </AuthShell>
  );
}
