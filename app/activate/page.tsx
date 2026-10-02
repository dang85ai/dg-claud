"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "daniel.f.guerra@gmail.com";
const BOOTSTRAP_URL =
  "https://sgoxywyhaketjmdmkzhm.supabase.co/functions/v1/admin-bootstrap";

export default function ActivatePage() {
  const router = useRouter();
  const [setupCode, setSetupCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function activate(event: FormEvent<HTMLFormElement>) {
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

    try {
      const response = await fetch(BOOTSTRAP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          setupCode: setupCode.trim(),
          password
        })
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        setStatus(
          result?.error ??
            "Unable to activate the administrator account. Check the setup code and try again."
        );
        setBusy(false);
        return;
      }

      const signIn = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password
      });

      if (signIn.error || !signIn.data.session) {
        setStatus(
          "Your password was created, but automatic sign-in failed. Open the login page and sign in with the password you just created."
        );
        setBusy(false);
        return;
      }

      router.replace("/mfa");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to activate the administrator account."
      );
      setBusy(false);
    }
  }

  return (
    <AuthShell eyebrow="Administrator Activation" title="Activate Admin Account">
      <div className="rounded-2xl bg-neutral-50 p-5">
        <div className="flex items-center gap-2 font-black uppercase">
          <ShieldCheck className="text-red-600" size={18} />
          One-time admin setup
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          No email is required. Enter the one-time admin setup code, choose your password, and you will continue directly to MFA setup.
        </p>
        <div className="mt-4 text-sm">
          <span className="font-black">Admin email:</span> {ADMIN_EMAIL}
        </div>
      </div>

      <form className="mt-6" onSubmit={activate}>
        <div className="field-group">
          <label className="field-label" htmlFor="setupCode">
            One-Time Admin Setup Code
          </label>
          <input
            className="field text-center text-xl font-black tracking-[0.18em]"
            id="setupCode"
            type="text"
            autoCapitalize="characters"
            autoCorrect="off"
            value={setupCode}
            onChange={(event) =>
              setSetupCode(
                event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, 10)
              )
            }
            required
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="password">
            New Password
          </label>
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
          <label className="field-label" htmlFor="confirm">
            Confirm Password
          </label>
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

        <button
          className="btn btn-primary w-full"
          type="submit"
          disabled={busy || setupCode.length < 8}
        >
          <KeyRound size={18} />
          {busy ? "Activating…" : "Activate Admin & Continue to MFA"}
        </button>
      </form>

      {status ? <div className="notice mt-5 text-sm">{status}</div> : null}
    </AuthShell>
  );
}
