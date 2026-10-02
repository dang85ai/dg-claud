"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { supabase } from "@/lib/supabase";

const DEFAULT_ADMIN_EMAIL = "daniel.f.guerra@gmail.com";
const ACTIVATION_URL = "https://caledon-u9-girls-2026.netlify.app/activate";

export default function ActivatePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [status, setStatus] = useState("Checking your activation…");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function resolveSession() {
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") as EmailOtpType | null;
      const code = url.searchParams.get("code");

      if (tokenHash && type) {
        const verify = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type
        });

        if (!mounted) return;

        if (verify.error) {
          setStatus("That recovery link is invalid or expired. Send yourself a fresh password setup email below.");
        } else {
          window.history.replaceState({}, document.title, "/activate");
        }
      } else if (code) {
        const exchanged = await supabase.auth.exchangeCodeForSession(code);

        if (!mounted) return;

        if (exchanged.error) {
          setStatus("That recovery link is invalid or expired. Send yourself a fresh password setup email below.");
        } else {
          window.history.replaceState({}, document.title, "/activate");
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setStatus(error.message);
        return;
      }

      if (data.session?.user) {
        setEmail(data.session.user.email ?? DEFAULT_ADMIN_EMAIL);
        setReady(true);
        setStatus("");
      } else if (!tokenHash && !code) {
        setReady(false);
        setStatus("Send yourself a secure password setup email to continue.");
      }
    }

    void resolveSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setEmail(session.user.email ?? DEFAULT_ADMIN_EMAIL);
        setReady(true);
        setStatus("");
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function sendSetupEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: ACTIVATION_URL
    });

    if (error) {
      setStatus(`Unable to send the setup email: ${error.message}`);
      setBusy(false);
      return;
    }

    setSent(true);
    setStatus("Password setup email sent. Check Inbox, Spam and Promotions, then open the newest message.");
    setBusy(false);
  }

  async function setPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 12) {
      setStatus("Use a password with at least 12 characters.");
      setBusy(false);
      return;
    }

    if (password !== confirm) {
      setStatus("The two passwords do not match.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
      data: {
        must_change_password: false,
        password_setup_complete: true
      }
    });

    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }

    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      setStatus("Your password was saved, but the secure session needs to be renewed. Sign in with your new password, then continue to MFA.");
      setBusy(false);
      return;
    }

    router.replace("/mfa");
  }

  return (
    <AuthShell eyebrow="Administrator Activation" title={ready ? "Create Your Password" : "Set Up Admin Access"}>
      <div className="rounded-2xl bg-neutral-50 p-5">
        <div className="flex items-center gap-2 font-black uppercase">
          <ShieldCheck className="text-red-600" size={18} />
          Secure admin setup
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          First send a secure password setup email to your admin address. Open the newest recovery email, return here, create your password, then complete MFA before entering the Command Centre.
        </p>
      </div>

      {!ready ? (
        <form className="mt-6" onSubmit={sendSetupEmail}>
          <div className="field-group">
            <label className="field-label" htmlFor="email">Admin Email</label>
            <input
              className="field"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary w-full" type="submit" disabled={busy}>
            <Mail size={18} />
            {busy ? "Sending…" : sent ? "Send Another Setup Email" : "Send Password Setup Email"}
          </button>
        </form>
      ) : null}

      {ready ? (
        <form className="mt-6" onSubmit={setPassword}>
          <div className="mb-5 text-sm">
            <span className="font-black">Admin email:</span> {email}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">New Password</label>
            <input
              className="field"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="confirm">Confirm Password</label>
            <input
              className="field"
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </div>

          <button className="btn btn-primary w-full" type="submit" disabled={busy}>
            <KeyRound size={18} />
            {busy ? "Saving…" : "Set Password & Continue to MFA"}
          </button>
        </form>
      ) : null}

      {status ? <div className="notice mt-5 text-sm">{status}</div> : null}
    </AuthShell>
  );
}
