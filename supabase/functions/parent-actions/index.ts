
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const allowedAttendance = new Set(["unknown","attending","not_attending","maybe"]);
const allowedCarpool = new Set(["offer","request"]);
const allowedSisterhood = new Set(["great_pass","great_teammate","never_gave_up","awesome_effort","sportsmanship","other"]);

function cleanText(v: unknown, max = 1000) {
  const s = String(v ?? "").trim();
  return s.slice(0, max);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Authentication required.");

    const url = Deno.env.get("SUPABASE_URL")!;
    const publishableKey = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")!)["default"];
    const supabase = createClient(url, publishableKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const token = authHeader.slice(7);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid or expired session.");
    const userId = userData.user.id;

    const [{ data: roles, error: rolesError }, { data: guardian, error: guardianError }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("guardians").select("id").eq("user_id", userId).maybeSingle()
    ]);
    if (rolesError) throw rolesError;
    if (guardianError) throw guardianError;

    const roleNames = (roles ?? []).map((r:any) => r.role);
    if (!roleNames.some((r:string) => ["parent_player","admin","manager","photographer"].includes(r))) {
      throw new Error("Team access is required.");
    }

    const payload = await req.json();
    const action = cleanText(payload?.action, 80);
    const input = payload?.input ?? {};

    let data: any = null;

    if (action === "attendance.set") {
      const status = cleanText(input.status, 30);
      if (!allowedAttendance.has(status)) throw new Error("Invalid attendance status.");
      const row = {
        event_id: input.event_id,
        player_id: input.player_id,
        status,
        note: cleanText(input.note, 500) || null,
        updated_by: userId
      };
      const result = await supabase.from("attendance")
        .upsert(row, { onConflict: "event_id,player_id" })
        .select("event_id,player_id,status,note,updated_at")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "duty.claim") {
      if (!guardian?.id) throw new Error("Guardian profile required.");
      const result = await supabase.from("duty_claims")
        .insert({ duty_id: input.duty_id, guardian_id: guardian.id })
        .select("id,duty_id,guardian_id,claimed_at")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "duty.release") {
      if (!guardian?.id) throw new Error("Guardian profile required.");
      const result = await supabase.from("duty_claims")
        .delete()
        .eq("duty_id", input.duty_id)
        .eq("guardian_id", guardian.id)
        .select("id");
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "carpool.create") {
      const kind = cleanText(input.kind, 20);
      if (!allowedCarpool.has(kind)) throw new Error("Invalid carpool type.");
      const neighbourhood = cleanText(input.neighbourhood, 120);
      if (!neighbourhood) throw new Error("Neighbourhood is required.");
      const seats = input.seats == null ? null : Number(input.seats);
      if (seats !== null && (!Number.isInteger(seats) || seats < 1 || seats > 8)) throw new Error("Seats must be between 1 and 8.");

      const result = await supabase.from("carpool_posts")
        .insert({
          created_by: userId,
          player_id: input.player_id || null,
          kind,
          neighbourhood,
          seats,
          event_id: input.event_id || null,
          note: cleanText(input.note, 500) || null,
          active: true
        })
        .select("*")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "carpool.update") {
      const patch:any = {};
      if ("neighbourhood" in input) patch.neighbourhood = cleanText(input.neighbourhood, 120);
      if ("seats" in input) {
        const seats = input.seats == null ? null : Number(input.seats);
        if (seats !== null && (!Number.isInteger(seats) || seats < 1 || seats > 8)) throw new Error("Seats must be between 1 and 8.");
        patch.seats = seats;
      }
      if ("note" in input) patch.note = cleanText(input.note, 500) || null;
      if ("active" in input) patch.active = Boolean(input.active);

      const result = await supabase.from("carpool_posts")
        .update(patch)
        .eq("id", input.id)
        .eq("created_by", userId)
        .select("*")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "carpool.delete") {
      const result = await supabase.from("carpool_posts")
        .delete()
        .eq("id", input.id)
        .eq("created_by", userId)
        .select("id");
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "sisterhood.create") {
      const category = cleanText(input.category, 40);
      if (!allowedSisterhood.has(category)) throw new Error("Invalid Sisterhood category.");
      const body = cleanText(input.body, 600);
      if (!body) throw new Error("Message is required.");

      const result = await supabase.from("sisterhood_posts")
        .insert({
          submitted_by: userId,
          player_id: input.player_id || null,
          category,
          body,
          status: "pending"
        })
        .select("id,player_id,category,body,status,created_at")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "sisterhood.delete") {
      const result = await supabase.from("sisterhood_posts")
        .delete()
        .eq("id", input.id)
        .eq("submitted_by", userId)
        .select("id");
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "notification_preferences.set") {
      const row = {
        user_id: userId,
        game_reminders: input.game_reminders !== false,
        practice_reminders: input.practice_reminders !== false,
        weather_alerts: input.weather_alerts !== false,
        schedule_changes: input.schedule_changes !== false,
        coach_announcements: input.coach_announcements !== false,
        kit_payment_reminders: input.kit_payment_reminders !== false
      };
      const result = await supabase.from("notification_preferences")
        .upsert(row, { onConflict: "user_id" })
        .select("*")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "form.submit") {
      if (!guardian?.id) throw new Error("Guardian profile required.");
      const formKey = cleanText(input.form_key, 80);
      if (!["medical_release","photo_consent"].includes(formKey)) throw new Error("Unsupported form.");
      const signatureName = cleanText(input.signature_name, 160);
      if (!signatureName) throw new Error("Signature name is required.");

      const templateRes = await supabase.from("form_templates")
        .select("id,form_key,title,version")
        .eq("form_key", formKey)
        .eq("active", true)
        .order("version", { ascending:false })
        .limit(1)
        .maybeSingle();
      if (templateRes.error) throw templateRes.error;
      if (!templateRes.data) throw new Error("Active form template not found.");

      const submission = await supabase.from("form_submissions").insert({
        form_template_id: templateRes.data.id,
        player_id: input.player_id,
        guardian_id: guardian.id,
        submitted_data: input.submitted_data ?? {},
        signature_name: signatureName,
        signed_at: new Date().toISOString()
      }).select("id,form_template_id,player_id,guardian_id,signature_name,signed_at").single();
      if (submission.error) throw submission.error;

      let consent = null;
      if (formKey === "photo_consent") {
        const values = input.submitted_data ?? {};
        const existing = await supabase.from("consents")
          .select("id")
          .eq("player_id", input.player_id)
          .eq("guardian_id", guardian.id)
          .is("revoked_at", null);
        if (existing.error) throw existing.error;

        if ((existing.data ?? []).length) {
          const ids = existing.data.map((x:any) => x.id);
          const revoke = await supabase.from("consents")
            .update({ revoked_at: new Date().toISOString() })
            .in("id", ids);
          if (revoke.error) throw revoke.error;
        }

        const consentRes = await supabase.from("consents").insert({
          player_id: input.player_id,
          guardian_id: guardian.id,
          public_profile_consent: Boolean(values.public_profile_consent),
          birthday_display_consent: Boolean(values.birthday_display_consent),
          public_photo_consent: Boolean(values.public_photo_consent),
          private_team_photo_consent: values.private_team_photo_consent !== false,
          social_media_consent: Boolean(values.social_media_consent),
          video_consent: Boolean(values.video_consent),
          notes: cleanText(values.notes, 1000) || null
        }).select("*").single();
        if (consentRes.error) throw consentRes.error;
        consent = consentRes.data;
      }

      data = {
        submission: submission.data,
        form: templateRes.data,
        consent
      };
    } else if (action === "lost_found.create") {
      const kind = cleanText(input.kind, 20);
      if (!["lost","found","gear_swap"].includes(kind)) throw new Error("Invalid post type.");
      const title = cleanText(input.title, 160);
      if (!title) throw new Error("Title is required.");

      const result = await supabase.from("lost_found_posts")
        .insert({
          created_by: userId,
          kind,
          title,
          body: cleanText(input.body, 1200) || null,
          photo_path: cleanText(input.photo_path, 500) || null,
          active: true
        })
        .select("*")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "lost_found.update") {
      const patch:any = {};
      if ("title" in input) patch.title = cleanText(input.title, 160);
      if ("body" in input) patch.body = cleanText(input.body, 1200) || null;
      if ("active" in input) patch.active = Boolean(input.active);

      const result = await supabase.from("lost_found_posts")
        .update(patch)
        .eq("id", input.id)
        .eq("created_by", userId)
        .select("*")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "lost_found.delete") {
      const result = await supabase.from("lost_found_posts")
        .delete()
        .eq("id", input.id)
        .eq("created_by", userId)
        .select("id");
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "profile.update") {
      const patch:any = {};
      if ("full_name" in input) patch.full_name = cleanText(input.full_name, 140) || null;
      if ("display_name" in input) patch.display_name = cleanText(input.display_name, 100) || null;
      if ("phone" in input) patch.phone = cleanText(input.phone, 40) || null;

      const result = await supabase.from("profiles")
        .update(patch)
        .eq("id", userId)
        .select("id,full_name,display_name,phone,updated_at")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else {
      throw new Error("Unsupported parent action.");
    }

    return new Response(JSON.stringify({ ok: true, action, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete action.";
    const status = message.includes("Authentication") || message.includes("session") ? 401 : 400;
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }
});
