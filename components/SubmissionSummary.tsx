"use client";

import Link from "next/link";
import { useState } from "react";
import { authedFetch } from "@/lib/api";
import { SUPABASE_URL, supabase } from "@/lib/supabase";

const sourceLabels: Record<string, string> = {
  contact: "Contact",
  sponsorship: "Sponsorship",
  signed_form: "Signed form",
  portal_kit_order: "Portal kit order",
  kit_request: "Public kit request",
  parent_invite: "Parent invite request"
};

const followUp: Record<string, string> = {
  contact: "Team manager",
  sponsorship: "Sponsorship coordinator",
  signed_form: "Team manager",
  kit_request: "Kit coordinator",
  portal_kit_order: "Kit coordinator",
  parent_invite: "Team manager"
};

export type Submission = {
  source: string;
  reference: string;
  submitted_at: string | null;
  review_status: string | null;
  delivery_status: string | null;
};

export function SubmissionSummary({ items, refresh }: { items: Submission[]; refresh: () => Promise<void> }) {
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function inspect(item: Submission) {
    if (open === item.reference) {
      setOpen(null);
      return;
    }
    setBusy(true);
    setOpen(item.reference);
    setDetail([]);
    setNotice("");
    try {
      const query = item.source === "parent_invite"
        ? supabase.from("parent_invite_requests").select("parent_name,player_name,email")
        : supabase.from("contact_submissions").select("name,email,phone,subject,message");
      const { data, error } = await query.eq("id", item.reference).single();
      if (error || !data) throw new Error("Unable to load the submission details.");
      setDetail(Object.values(data).filter((value): value is string => typeof value === "string" && Boolean(value)));
    } catch {
      setNotice("Unable to load the submission details.");
    } finally {
      setBusy(false);
    }
  }

  async function review(id: string, action: "approve" | "decline") {
    setBusy(true);
    setNotice("");
    try {
      const result = await authedFetch<{ message: string }>(SUPABASE_URL + "/functions/v1/parent-invite-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });
      setNotice(result.message);
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to review this request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-7 overflow-hidden" aria-labelledby="submissions-heading">
      <div className="p-5">
        <h2 id="submissions-heading" className="text-xl font-black uppercase">Recent Submissions</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Latest 100 submissions. Earlier public kit requests are archived in{" "}
          <Link className="font-bold underline" href="https://app.netlify.com/projects/caledon-u9-girls-2026/forms">
            Netlify Forms
          </Link>.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-100 text-xs uppercase">
            <tr>
              <th scope="col" className="p-3">Submission</th>
              <th scope="col" className="p-3">Received</th>
              <th scope="col" className="p-3">Record status</th>
              <th scope="col" className="p-3">Email status</th>
              <th scope="col" className="p-3">Follow-up role</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr className="border-t align-top" key={item.source + ":" + item.reference}>
                <th scope="row" className="p-3 text-left">
                  {sourceLabels[item.source] ?? item.source}
                  <span className="mt-1 block break-all text-xs font-normal text-neutral-600">{item.reference}</span>
                  {["contact", "kit_request", "parent_invite"].includes(item.source) && (
                    <button type="button" disabled={busy} className="mt-2 text-sm underline" aria-expanded={open === item.reference} onClick={() => void inspect(item)}>
                      {open === item.reference ? "Hide details" : "View details"}
                    </button>
                  )}
                  {open === item.reference && (
                    <div className="mt-2 max-w-md whitespace-pre-wrap break-words font-normal">
                      {detail.map((line, index) => <p key={index} className="mb-1">{line}</p>)}
                      {notice && <p role="status" className="mt-2">{notice}</p>}
                      {item.source === "parent_invite" && ["pending", "failed"].includes(item.review_status ?? "") && detail.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" disabled={busy} className="btn btn-primary" onClick={() => void review(item.reference, "approve")}>Approve &amp; email</button>
                          <button type="button" disabled={busy} className="btn btn-light" onClick={() => void review(item.reference, "decline")}>Decline</button>
                        </div>
                      )}
                    </div>
                  )}
                </th>
                <td className="p-3">{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "Unavailable"}</td>
                <td className="p-3">{item.review_status?.replaceAll("_", " ") ?? "Unavailable"}</td>
                <td className="p-3">{item.delivery_status?.replaceAll("_", " ") ?? "No email record"}</td>
                <td className="p-3">{followUp[item.source] ?? "Team manager"}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-5">No submissions to display.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

