"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { supabase } from "@/lib/supabase";

type Mode = "loading" | "challenge" | "enroll" | "error";

function normalizeQrCode(value: string | undefined | null) {
  if (!value) return "";
  const qr = value.trim();

  if (qr.startsWith("data:image/")) return qr;

  // Some Supabase/Auth versions return the SVG markup itself rather than a data URL.
  if (qr.startsWith("<svg") || qr.startsWith("<?xml")) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`;
  }

  return qr;
}

export default function MfaPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const initialize = useCallback(async () => {
    setMode("loading");
    setStatus("");
    setFactorId("");
    setQr("");
    setSecret("");
    setUri("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      setStatus(sessionError.message);
      setMode("error");
      return;
    }

    if (!sessionData.session) {
      setStatus("Your secure session has ended. Sign in again, then return to MFA setup.");
      setMode("error");
      return;
    }

    const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal.error) {
      setStatus(`Unable to check MFA status: ${aal.error.message}`);
      setMode("error");
      return;
    }

    if (aal.data.currentLevel === "aal2") {
      router.replace("/admin");
      return;
    }

    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) {
      setStatus(`Unable to load MFA factors: ${factors.error.message}`);
      setMode("error");
      return;
    }

    const verifiedTotp = factors.data.totp.find((factor) => factor.status === "verified");

    if (verifiedTotp) {
      setFactorId(verifiedTotp.id);
      setMode("challenge");
      return;
    }

    const enroll = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Caledon U9 Girls Admin"
    });

    if (enroll.error) {
      setStatus(`Unable to start authenticator setup: ${enroll.error.message}`);
      setMode("error");
      return;
    }

    const qrCode = normalizeQrCode(enroll.data.totp?.qr_code);

    setFactorId(enroll.data.id);
    setQr(qrCode);
    setSecret(enroll.data.totp?.secret ?? "");
    setUri(enroll.data.totp?.uri ?? "");

    if (!qrCode && !enroll.data.totp?.secret) {
      setStatus("Supabase started MFA enrollment but did not return a QR code or manual setup key. Select Retry MFA Setup.");
      setMode("error");
      return;
    }

    setMode("enroll");
  }, [router]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  async function verify() {
    const trimmedCode = code.trim();

    if (!factorId || trimmedCode.length !== 6) {
      setStatus("Enter the 6-digit code shown in your authenticator app.");
      return;
    }

    setBusy(true);
    setStatus("");

    const result = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: trimmedCode
    });

    if (result.error) {
      setStatus(`Authenticator code could not be verified: ${result.error.message}`);
      setBusy(false);
      return;
    }

    await supabase.auth.refreshSession();
    router.replace("/admin");
  }

  return (
    <AuthShell
      eyebrow="Account Security"
      title={mode === "enroll" ? "Set Up MFA" : mode === "challenge" ? "Verify MFA" : "MFA Security"}
    >
      {mode === "loading" ? (
        <div className="grid min-h-40 place-items-center text-center">
          <div>
            <RefreshCw className="mx-auto animate-spin text-red-600" />
            <p className="mt-4 text-sm text-neutral-600">Preparing authenticator setup…</p>
          </div>
        </div>
      ) : null}

      {mode === "enroll" ? (
        <>
          <div className="rounded-2xl bg-neutral-50 p-5">
            <div className="flex items-center gap-2 font-black uppercase">
              <ShieldCheck className="text-red-600" size={18} />
              Authenticator app setup
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              Scan the QR code with Google Authenticator, Microsoft Authenticator, 1Password, Authy, or another TOTP-compatible authenticator. Then enter the 6-digit code it generates.
            </p>
          </div>

          {qr ? (
            <div className="mt-6 grid place-items-center rounded-2xl border border-neutral-200 bg-white p-5">
              <img
                src={qr}
                alt="QR code for setting up multi-factor authentication"
                width={260}
                height={260}
                className="h-auto w-full max-w-[260px]"
              />
            </div>
          ) : null}

          {secret ? (
            <div className="mt-4 rounded-xl bg-neutral-100 p-4">
              <div className="text-xs font-black uppercase text-neutral-500">Manual setup key</div>
              <p className="mt-2 text-xs text-neutral-600">
                If your phone cannot scan the QR code, choose manual setup in your authenticator app and enter this key.
              </p>
              <code className="mt-3 block select-all break-all rounded-lg bg-white p-3 text-sm font-bold">
                {secret}
              </code>
            </div>
          ) : null}

          {uri ? (
            <details className="mt-3 rounded-xl border border-neutral-200 bg-white p-4">
              <summary className="cursor-pointer text-sm font-black">Advanced setup URI</summary>
              <code className="mt-3 block break-all text-xs text-neutral-600">{uri}</code>
            </details>
          ) : null}
        </>
      ) : null}

      {mode === "challenge" ? (
        <div className="rounded-2xl bg-neutral-50 p-5">
          <div className="flex items-center gap-2 font-black uppercase">
            <ShieldCheck className="text-red-600" size={18} />
            MFA already enrolled
          </div>
          <p className="mt-3 text-sm text-neutral-600">
            Open your authenticator app and enter the current 6-digit code for Caledon U9 Girls.
          </p>
        </div>
      ) : null}

      {(mode === "enroll" || mode === "challenge") ? (
        <>
          <div className="field-group mt-6">
            <label className="field-label" htmlFor="code">Authenticator Code</label>
            <input
              className="field text-center text-2xl font-black tracking-[0.35em]"
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              maxLength={6}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
          </div>

          <button
            type="button"
            onClick={verify}
            disabled={busy || code.length !== 6}
            className="btn btn-primary w-full"
          >
            {busy ? "Verifying…" : mode === "enroll" ? "Enable MFA & Open Command Centre" : "Verify & Continue"}
          </button>
        </>
      ) : null}

      {mode === "error" ? (
        <div className="mt-6 grid gap-3">
          <button type="button" onClick={() => void initialize()} className="btn btn-primary w-full">
            <RefreshCw size={18} />
            Retry MFA Setup
          </button>
          <button type="button" onClick={() => router.replace("/login")} className="btn btn-light w-full">
            Sign In Again
          </button>
        </div>
      ) : null}

      {status ? <div className="notice mt-5 text-sm">{status}</div> : null}
    </AuthShell>
  );
}
