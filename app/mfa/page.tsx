"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { supabase } from "@/lib/supabase";

type Mode = "loading" | "challenge" | "enroll";

export default function MfaPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace("/login");
        return;
      }

      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.error) {
        setStatus(aal.error.message);
        setMode("challenge");
        return;
      }

      if (aal.data.currentLevel === "aal2") {
        router.replace("/portal");
        return;
      }

      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) {
        setStatus(factors.error.message);
        setMode("challenge");
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
        friendlyName: "Caledon U9 Girls"
      });

      if (enroll.error) {
        setStatus(enroll.error.message);
        setMode("challenge");
        return;
      }

      setFactorId(enroll.data.id);
      setQr(enroll.data.totp.qr_code);
      setSecret(enroll.data.totp.secret);
      setMode("enroll");
    })();
  }, [router]);

  async function verify() {
    if (!factorId || !code.trim()) return;
    setBusy(true);
    setStatus("");

    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setStatus(challenge.error.message);
      setBusy(false);
      return;
    }

    const result = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: code.trim()
    });

    if (result.error) {
      setStatus(result.error.message);
      setBusy(false);
      return;
    }

    router.replace("/portal");
  }

  return (
    <AuthShell eyebrow="Account Security" title={mode === "enroll" ? "Set Up MFA" : "Verify MFA"}>
      {mode === "loading" ? (
        <p className="text-neutral-600">Checking account security…</p>
      ) : (
        <>
          {mode === "enroll" ? (
            <div>
              <p className="text-sm text-neutral-600">
                Scan this QR code with an authenticator app, then enter the six-digit code below.
              </p>
              {qr ? (
                <div className="mt-5 grid place-items-center rounded-2xl border border-neutral-200 bg-white p-4">
                  {/* Supabase returns the QR code as a data URL */}
                  <img src={qr} alt="Authenticator setup QR code" className="max-w-[240px]" />
                </div>
              ) : null}
              {secret ? (
                <div className="mt-4 rounded-xl bg-neutral-100 p-4">
                  <div className="text-xs font-black uppercase text-neutral-500">Manual setup key</div>
                  <code className="mt-2 block break-all text-sm">{secret}</code>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              Enter the current code from your authenticator app.
            </p>
          )}

          <div className="field-group mt-6">
            <label className="field-label" htmlFor="code">Authenticator Code</label>
            <input
              className="field"
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              maxLength={8}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            />
          </div>

          <button type="button" onClick={verify} disabled={busy || !code} className="btn btn-primary w-full">
            {busy ? "Verifying…" : mode === "enroll" ? "Enable MFA" : "Verify & Continue"}
          </button>

          {status ? <p className="notice mt-5 text-sm">{status}</p> : null}
        </>
      )}
    </AuthShell>
  );
}
