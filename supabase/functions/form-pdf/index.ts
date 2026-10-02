
import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

function printable(value: unknown) {
  return String(value ?? "")
    .replace(/[^ -~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function labelize(key:string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function wrap(text:string, max=82) {
  const words = printable(text).split(" ");
  const lines:string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? line + " " + word : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

Deno.serve(async (req:Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error:"Method not allowed" }), {
      status:405, headers:{ ...corsHeaders, "Content-Type":"application/json" }
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Authentication required.");
    const token = authHeader.slice(7);
    const requestUrl = new URL(req.url);
    const submissionId = requestUrl.searchParams.get("submission_id");
    if (!submissionId) throw new Error("submission_id is required.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const publishableKey = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")!)["default"];
    const supabase = createClient(supabaseUrl, publishableKey, {
      global:{ headers:{ Authorization:authHeader } },
      auth:{ persistSession:false, autoRefreshToken:false }
    });

    const { data:userData, error:userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid or expired session.");

    const submissionRes = await supabase.from("form_submissions")
      .select("id,form_template_id,player_id,guardian_id,submitted_data,signature_name,signed_at")
      .eq("id", submissionId)
      .maybeSingle();
    if (submissionRes.error) throw submissionRes.error;
    if (!submissionRes.data) throw new Error("Form submission not found or access denied.");

    const submission = submissionRes.data;

    const [templateRes, playerRes, guardianRes] = await Promise.all([
      supabase.from("form_templates")
        .select("form_key,title,version,description")
        .eq("id", submission.form_template_id)
        .single(),
      supabase.from("players")
        .select("first_name,last_name,jersey_number")
        .eq("id", submission.player_id)
        .single(),
      supabase.from("guardians")
        .select("full_name,phone")
        .eq("id", submission.guardian_id)
        .single()
    ]);
    for (const r of [templateRes, playerRes, guardianRes]) if (r.error) throw r.error;

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    let page = pdf.addPage([612, 792]);
    let y = 744;

    const addPageIfNeeded = () => {
      if (y < 70) {
        page = pdf.addPage([612, 792]);
        y = 744;
      }
    };

    const drawLine = (text:string, size=10, isBold=false, indent=0) => {
      addPageIfNeeded();
      page.drawText(printable(text), {
        x: 54 + indent,
        y,
        size,
        font: isBold ? bold : font,
        color: rgb(0,0,0)
      });
      y -= size + 6;
    };

    page.drawText("CALEDON SOCCER CLUB", { x:54, y, size:18, font:bold, color:rgb(0.85,0,0) });
    y -= 25;
    drawLine("U9 Girls 2026", 13, true);
    y -= 6;
    drawLine(printable(templateRes.data.title), 16, true);
    drawLine("Form Version: " + templateRes.data.version, 9);
    drawLine("Submission ID: " + submission.id, 9);
    y -= 8;

    drawLine("Player", 12, true);
    drawLine(
      printable(playerRes.data.first_name) + " " + printable(playerRes.data.last_name) +
      (playerRes.data.jersey_number != null ? "  |  #" + playerRes.data.jersey_number : ""),
      10
    );
    y -= 4;

    drawLine("Parent / Guardian", 12, true);
    drawLine(printable(guardianRes.data.full_name), 10);
    if (guardianRes.data.phone) drawLine("Phone: " + printable(guardianRes.data.phone), 10);
    y -= 6;

    drawLine("Submitted Information", 12, true);
    const submitted = submission.submitted_data ?? {};
    for (const [key, value] of Object.entries(submitted)) {
      if (key === "signature") continue;
      const display =
        typeof value === "boolean" ? (value ? "Yes" : "No") :
        value == null ? "" :
        typeof value === "object" ? JSON.stringify(value) :
        String(value);
      drawLine(labelize(key) + ":", 10, true);
      for (const line of wrap(display, 76)) drawLine(line, 10, false, 12);
      y -= 2;
    }

    y -= 8;
    drawLine("Electronic Acknowledgement", 12, true);
    drawLine("Signed by: " + printable(submission.signature_name), 10, true);
    drawLine("Signed at: " + new Date(submission.signed_at).toISOString(), 10);
    drawLine("Authenticated user: " + printable(userData.user.email ?? userData.user.id), 9);
    y -= 8;

    for (const line of wrap(
      "This PDF is a record of the information and electronic acknowledgement submitted through the private Caledon U9 Girls 2026 team portal."
    )) drawLine(line, 9);

    const bytes = await pdf.save();
    const filename = (templateRes.data.form_key || "team-form") + "-" + submission.id + ".pdf";

    return new Response(bytes, {
      status:200,
      headers:{
        ...corsHeaders,
        "Content-Type":"application/pdf",
        "Content-Disposition":'attachment; filename="' + filename + '"',
        "Cache-Control":"no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate PDF.";
    const status =
      message.includes("Authentication") || message.includes("session") ? 401 :
      message.includes("access denied") ? 403 : 400;
    return new Response(JSON.stringify({ error:message }), {
      status,
      headers:{ ...corsHeaders, "Content-Type":"application/json", "Cache-Control":"no-store" }
    });
  }
});
