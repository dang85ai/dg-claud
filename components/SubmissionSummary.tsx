import Link from "next/link";

const sourceLabels: Record<string, string> = {
  contact: "Contact",
  sponsorship: "Sponsorship",
  signed_form: "Signed form",
  portal_kit_order: "Portal kit order"
};

export type Submission = {
  source: string;
  reference: string;
  submitted_at: string | null;
  review_status: string | null;
  delivery_status: string | null;
};

export function SubmissionSummary({ items }: { items: Submission[] }) {
  return (
    <section className="card mt-7 overflow-hidden" aria-labelledby="submissions-heading">
      <div className="p-5">
        <h2 id="submissions-heading" className="text-xl font-black uppercase">Recent Submissions</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Latest 100 Supabase submissions. Public kit requests are in{" "}
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
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr className="border-t align-top" key={item.reference}>
                <th scope="row" className="p-3 text-left">
                  {sourceLabels[item.source] ?? item.source}
                  <span className="mt-1 block break-all text-xs font-normal text-neutral-600">{item.reference}</span>
                </th>
                <td className="p-3">{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "Unavailable"}</td>
                <td className="p-3">{item.review_status?.replaceAll("_", " ") ?? "Unavailable"}</td>
                <td className="p-3">{item.delivery_status?.replaceAll("_", " ") ?? "No email record"}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="p-5">No submissions to display.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

