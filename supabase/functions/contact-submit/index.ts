
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const KIT_SUBJECT = "Caledon United 2018 Girls — Team Kit Order Request";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIER_KEYS = new Set([
  "community_supporter",
  "friend_of_team",
  "team_supporter",
  "digital_sponsor",
  "team_sponsor",
  "main_jersey_sponsor"
]);

async function cleanupContact(supabaseUrl:string, secretKey:string, id:string) {
  await fetch(`${supabaseUrl}/rest/v1/contact_submissions?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { apikey: secretKey }
  }).catch(() => {});
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const phone = String(body?.phone ?? "").trim();
    const kitRequest = body?.kind === "kit_request";
    const subject = kitRequest ? KIT_SUBJECT : String(body?.subject ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const website = String(body?.website ?? "").trim();
    const sponsorship = body?.sponsorship && typeof body.sponsorship === "object"
      ? body.sponsorship
      : null;

    if (website) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (name.length < 1 || name.length > 120) throw new Error("Please enter a valid name.");
    if (!EMAIL_RE.test(email) || email.length > 320) throw new Error("Please enter a valid email.");
    if (phone.length > 40 || subject.length > 180) throw new Error("Invalid form content.");
    if (message.length < 1 || message.length > 5000) throw new Error("Please enter a message.");

    if (kitRequest && (sponsorship || body.acknowledged !== true)) {
      throw new Error("Confirm that this is a team kit request before submitting.");
    }

    if (!kitRequest && subject === KIT_SUBJECT) throw new Error("Please use the team kit request form.");

    let sponsorData:any = null;
    if (sponsorship) {
      const businessName = String(sponsorship.business_name ?? "").trim().slice(0, 180);
      const tierKey = String(sponsorship.tier_key ?? "").trim();
      const rawAmount = sponsorship.amount_cad;
      const amount = rawAmount === null || rawAmount === undefined || rawAmount === ""
        ? null
        : Number(rawAmount);
      const notes = String(sponsorship.notes ?? "").trim().slice(0, 3000);
      const anonymous = Boolean(sponsorship.anonymous);

      if (tierKey && !TIER_KEYS.has(tierKey)) throw new Error("Invalid sponsorship level.");
      if (amount !== null && (!Number.isFinite(amount) || amount <= 0 || amount > 100000)) {
        throw new Error("Invalid sponsorship amount.");
      }

      sponsorData = {
        business_name: businessName || null,
        tier_key: tierKey || null,
        amount_cad: amount,
        notes: notes || null,
        anonymous
      };
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (!supabaseUrl || !secretKeysRaw) throw new Error("Server is not configured.");
    const secretKey = JSON.parse(secretKeysRaw)["default"];
    if (!secretKey) throw new Error("Server is not configured.");

    const contactResponse = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
      method: "POST",
      headers: {
        apikey: secretKey,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        status: "new",
        notification_routed_to: "girlsoccer2018@gmail.com",
        website_honeypot: ""
      })
    });

    if (!contactResponse.ok) throw new Error("Unable to submit the form.");
    const contactRows = await contactResponse.json();
    const contactId = contactRows?.[0]?.id;
    if (!contactId) throw new Error("Unable to submit the form.");

    let reference = contactId;
    if (sponsorData) {
      const sponsorResponse = await fetch(`${supabaseUrl}/rest/v1/sponsorship_inquiries`, {
        method: "POST",
        headers: {
          apikey: secretKey,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          contact_submission_id: contactId,
          name,
          email,
          phone: phone || null,
          business_name: sponsorData.business_name,
          tier_key: sponsorData.tier_key,
          amount_cad: sponsorData.amount_cad,
          notes: sponsorData.notes,
          anonymous: sponsorData.anonymous,
          status: "new",
          source: "website"
        })
      });

      if (!sponsorResponse.ok) {
        await cleanupContact(supabaseUrl, secretKey, contactId);
        throw new Error("Unable to submit sponsorship interest.");
      }
      reference = (await sponsorResponse.json())[0].id;
    }

    // Save is complete. Dispatch independently; email failures must not erase
    // the contact or sponsorship record. Outbox trigger logs status and retries.
    let notificationStatus="queued";
    try {
      const notify=await fetch(supabaseUrl+"/functions/v1/notification-dispatch",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+secretKey,"apikey":secretKey},
        body:JSON.stringify({source_id:contactId}),
        signal:AbortSignal.timeout(9000)
      });
      const result=await notify.json().catch(()=>({status:"queued"}));
      notificationStatus=String(result.status||"queued");
    } catch {
      console.error("Contact notification dispatch unavailable; inquiry remains saved.");
    }

    return new Response(JSON.stringify({
      ok: true,
      reference,
      notification_status: notificationStatus,
      message: sponsorData
        ? "Your sponsorship interest has been saved for the team to review. No payment has been taken."
        : "Your message has been saved for the team to review."
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unable to submit form."
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }
});
