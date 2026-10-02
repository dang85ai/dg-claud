
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function cleanText(v: unknown, max = 1000) {
  return String(v ?? "").trim().slice(0, max);
}

function decodePayload(token:string) {
  const part = token.split(".")[1];
  if (!part) return {};
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(atob(padded));
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
    const token = authHeader.slice(7);

    const url = Deno.env.get("SUPABASE_URL")!;
    const publishableKey = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")!)["default"];
    const supabase = createClient(url, publishableKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid or expired session.");
    const userId = userData.user.id;

    const rolesRes = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (rolesRes.error) throw rolesRes.error;
    const roles = (rolesRes.data ?? []).map((r:any) => r.role);
    if (!roles.some((r:string) => r === "admin" || r === "manager")) {
      throw new Error("Admin or manager access required.");
    }

    const claims:any = decodePayload(token);
    if (claims.aal !== "aal2") {
      return new Response(JSON.stringify({ ok:false, error:"Multi-factor authentication is required.", mfa_required:true }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const payload = await req.json();
    const action = cleanText(payload?.action, 100);
    const input = payload?.input ?? {};
    let data:any = null;

    if (action === "event.create") {
      const title = cleanText(input.title, 180);
      if (!title || !input.starts_at || !["game","practice","team_event"].includes(input.event_type)) {
        throw new Error("Event type, title and start time are required.");
      }
      const result = await supabase.from("events").insert({
        event_type: input.event_type,
        title,
        opponent: cleanText(input.opponent, 160) || null,
        home_away: input.home_away || null,
        starts_at: input.starts_at,
        ends_at: input.ends_at || null,
        arrival_at: input.arrival_at || null,
        venue_name: cleanText(input.venue_name, 180) || null,
        venue_address: cleanText(input.venue_address, 260) || null,
        notes: cleanText(input.notes, 2000) || null,
        uniform: cleanText(input.uniform, 200) || null,
        status: input.status || "scheduled",
        public_visible: input.public_visible !== false,
        weather_alert: cleanText(input.weather_alert, 500) || null,
        created_by: userId,
        external_source: cleanText(input.external_source, 80) || null,
        external_event_id: cleanText(input.external_event_id, 200) || null
      }).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "event.update") {
      const patch:any = {};
      for (const key of ["event_type","home_away","starts_at","ends_at","arrival_at","status","public_visible"]) {
        if (key in input) patch[key] = input[key];
      }
      for (const key of ["title","opponent","venue_name","venue_address","notes","uniform","weather_alert","external_source","external_event_id"]) {
        if (key in input) patch[key] = cleanText(input[key], key === "notes" ? 2000 : 500) || null;
      }
      const result = await supabase.from("events").update(patch).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "event.delete") {
      const result = await supabase.from("events").delete().eq("id", input.id).select("id");
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "weather_alert.set") {
      const result = await supabase.from("events")
        .update({ weather_alert: cleanText(input.weather_alert, 500) || null })
        .eq("id", input.event_id)
        .select("id,title,weather_alert")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "announcement.create") {
      const title = cleanText(input.title, 180);
      const body = cleanText(input.body, 5000);
      if (!title || !body) throw new Error("Title and body are required.");
      const result = await supabase.from("announcements").insert({
        title, body,
        visibility: input.visibility === "public" ? "public" : "team",
        pinned: Boolean(input.pinned),
        published_at: input.published_at || new Date().toISOString(),
        expires_at: input.expires_at || null,
        created_by: userId
      }).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "announcement.update") {
      const patch:any = {};
      for (const key of ["visibility","pinned","published_at","expires_at"]) if (key in input) patch[key] = input[key];
      for (const key of ["title","body"]) if (key in input) patch[key] = cleanText(input[key], key === "body" ? 5000 : 180);
      const result = await supabase.from("announcements").update(patch).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "announcement.delete") {
      const result = await supabase.from("announcements").delete().eq("id", input.id).select("id");
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "player.create") {
      const firstName = cleanText(input.first_name, 80);
      const lastName = cleanText(input.last_name, 100);
      if (!firstName || !lastName) throw new Error("First and last name are required.");
      const created = await supabase.from("players").insert({
        first_name: firstName,
        last_name: lastName,
        jersey_number: input.jersey_number ?? null,
        position: cleanText(input.position, 80) || null,
        date_of_birth: input.date_of_birth || null,
        active: true
      }).select("*").single();
      if (created.error) throw created.error;

      const pub = await supabase.from("player_public_profiles").insert({
        player_id: created.data.id,
        display_first_name: firstName,
        jersey_number: input.jersey_number ?? null,
        position: cleanText(input.position, 80) || null,
        public_visible: false
      }).select("*").single();
      if (pub.error) throw pub.error;
      data = { player: created.data, public_profile: pub.data };
    } else if (action === "player.update") {
      const patch:any = {};
      for (const key of ["jersey_number","date_of_birth","active"]) if (key in input) patch[key] = input[key];
      for (const key of ["first_name","last_name","position"]) if (key in input) patch[key] = cleanText(input[key], 100) || null;
      const result = await supabase.from("players").update(patch).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "player.deactivate") {
      const result = await supabase.from("players").update({ active:false }).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "public_profile.update") {
      const patch:any = {};
      for (const key of ["jersey_number","games_played","goals","assists","show_fun_facts","show_milestones","public_visible"]) {
        if (key in input) patch[key] = input[key];
      }
      for (const key of ["display_first_name","position","public_photo_path","favorite_player","favorite_snack","best_soccer_memory"]) {
        if (key in input) patch[key] = cleanText(input[key], key === "best_soccer_memory" ? 600 : 300) || null;
      }
      const result = await supabase.from("player_public_profiles").update(patch).eq("player_id", input.player_id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "spotlight.create") {
      const result = await supabase.from("player_spotlights").insert({
        player_id: input.player_id,
        event_id: input.event_id || null,
        heading: cleanText(input.heading, 120) || "Player of the Match",
        note: cleanText(input.note, 800) || null,
        starts_at: input.starts_at || new Date().toISOString(),
        ends_at: input.ends_at || null,
        active: true,
        created_by: userId
      }).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "spotlight.disable") {
      const result = await supabase.from("player_spotlights").update({ active:false }).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "media.review") {
      if (!["approved","rejected"].includes(input.status)) throw new Error("Invalid review status.");
      const current=await supabase.from("media_items").select("*").eq("id",input.id).single();
      if(current.error)throw current.error;
      if(input.status==="approved"&&(!current.data.exif_stripped||!current.data.processed_private_path||input.consent_reviewed!==true))throw new Error("A processed image and confirmed consent review are required.");
      const patch:any={
        status:input.status,
        visibility:"private_team",
        consent_reviewed:input.status==="approved"?true:current.data.consent_reviewed,
        approved_by:input.status==="approved"?userId:null,
        approved_at:input.status==="approved"?new Date().toISOString():null
      };
      const result=await supabase.from("media_items").update(patch).eq("id",input.id).select("*").single();
      if(result.error)throw result.error;
      const photoRequest=await supabase.from("profile_photo_requests").update({
        status:input.status,reviewed_by:userId,reviewed_at:new Date().toISOString()
      }).eq("media_id",input.id).eq("status","pending");
      if(photoRequest.error)throw photoRequest.error;
      data = result.data;
    } else if (action === "sisterhood.review") {
      if (!["approved","rejected"].includes(input.status)) throw new Error("Invalid moderation status.");
      const result = await supabase.from("sisterhood_posts").update({
        status: input.status,
        approved_by: userId,
        approved_at: new Date().toISOString()
      }).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "sponsorship_inquiry.update") {
      const allowed = ["new","contacted","quoted","committed","declined","converted"];
      if (!allowed.includes(input.status)) throw new Error("Invalid sponsorship inquiry status.");
      const patch:any = {
        status: input.status,
        admin_notes: cleanText(input.admin_notes, 3000) || null
      };
      if ("tier_key" in input) patch.tier_key = cleanText(input.tier_key, 80) || null;
      if ("amount_cad" in input) {
        const amount = input.amount_cad === null || input.amount_cad === "" ? null : Number(input.amount_cad);
        if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 100000)) {
          throw new Error("Invalid sponsorship amount.");
        }
        patch.amount_cad = amount;
      }
      const result = await supabase.from("sponsorship_inquiries")
        .update(patch)
        .eq("id", input.id)
        .select("*")
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "sponsorship_inquiry.convert") {
      const inquiryRes = await supabase.from("sponsorship_inquiries")
        .select("*")
        .eq("id", input.id)
        .single();
      if (inquiryRes.error) throw inquiryRes.error;
      const inquiry = inquiryRes.data;
      if (inquiry.converted_sponsor_id || inquiry.status === "converted") {
        throw new Error("This inquiry has already been converted.");
      }

      let tierName = inquiry.tier_key;
      if (inquiry.tier_key) {
        const tierRes = await supabase.from("sponsorship_tiers")
          .select("name")
          .eq("tier_key", inquiry.tier_key)
          .maybeSingle();
        if (tierRes.error) throw tierRes.error;
        if (tierRes.data?.name) tierName = tierRes.data.name;
      }

      const sponsorName = cleanText(inquiry.business_name || inquiry.name, 180);
      if (!sponsorName) throw new Error("Sponsor name is required.");

      const sponsorRes = await supabase.from("sponsors").insert({
        name: sponsorName,
        sponsorship_level: tierName || null,
        amount_cad: inquiry.amount_cad ?? null,
        active: true
      }).select("*").single();
      if (sponsorRes.error) throw sponsorRes.error;

      const inquiryUpdate = await supabase.from("sponsorship_inquiries").update({
        status: "converted",
        converted_sponsor_id: sponsorRes.data.id,
        admin_notes: cleanText(input.admin_notes, 3000) || inquiry.admin_notes || null
      }).eq("id", inquiry.id).select("*").single();

      if (inquiryUpdate.error) {
        await supabase.from("sponsors").delete().eq("id", sponsorRes.data.id);
        throw inquiryUpdate.error;
      }

      data = { inquiry: inquiryUpdate.data, sponsor: sponsorRes.data };
    } else if (action === "sponsor.create") {
      const name = cleanText(input.name, 180);
      if (!name) throw new Error("Sponsor name is required.");
      const result = await supabase.from("sponsors").insert({
        name,
        logo_path: cleanText(input.logo_path, 500) || null,
        website_url: cleanText(input.website_url, 500) || null,
        sponsorship_level: cleanText(input.sponsorship_level, 100) || null,
        amount_cad: input.amount_cad ?? null,
        sponsor_of_week_start: input.sponsor_of_week_start || null,
        sponsor_of_week_end: input.sponsor_of_week_end || null,
        active: true
      }).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "sponsor.update") {
      const patch:any = {};
      for (const key of ["amount_cad","sponsor_of_week_start","sponsor_of_week_end","active"]) if (key in input) patch[key] = input[key];
      for (const key of ["name","logo_path","website_url","sponsorship_level"]) if (key in input) patch[key] = cleanText(input[key], 500) || null;
      const result = await supabase.from("sponsors").update(patch).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "kit_order.status") {
      if (!["unpaid","partial","paid","refunded"].includes(input.payment_status)) throw new Error("Invalid payment status.");
      const result = await supabase.from("kit_orders").update({ payment_status: input.payment_status }).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "equipment.create") {
      const itemName = cleanText(input.item_name, 180);
      if (!itemName) throw new Error("Equipment name is required.");
      const result = await supabase.from("equipment").insert({
        asset_tag: cleanText(input.asset_tag, 100) || null,
        item_name: itemName,
        description: cleanText(input.description, 1000) || null,
        status: "available"
      }).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "equipment.assign") {
      const assign = await supabase.from("equipment_assignments").insert({
        equipment_id: input.equipment_id,
        player_id: input.player_id || null,
        assigned_to_text: cleanText(input.assigned_to_text, 180) || null,
        note: cleanText(input.note, 500) || null
      }).select("*").single();
      if (assign.error) throw assign.error;
      const equip = await supabase.from("equipment").update({ status:"issued" }).eq("id", input.equipment_id).select("*").single();
      if (equip.error) throw equip.error;
      data = { assignment: assign.data, equipment: equip.data };
    } else if (action === "equipment.return") {
      const returnedAt = new Date().toISOString();
      const assignment = await supabase.from("equipment_assignments").update({ returned_at: returnedAt }).eq("id", input.assignment_id).select("*").single();
      if (assignment.error) throw assignment.error;
      const equip = await supabase.from("equipment").update({ status:"available" }).eq("id", assignment.data.equipment_id).select("*").single();
      if (equip.error) throw equip.error;
      data = { assignment: assignment.data, equipment: equip.data };
    } else if (action === "referee.assign") {
      const result = await supabase.from("referee_assignments").insert({
        event_id: input.event_id,
        guardian_id: input.guardian_id || null,
        display_label: cleanText(input.display_label, 140) || null,
        role_label: cleanText(input.role_label, 120) || "Referee",
        confirmed: Boolean(input.confirmed)
      }).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "referee.delete") {
      const result = await supabase.from("referee_assignments").delete().eq("id", input.id).select("id");
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "content.page.publish") {
      const result = await supabase.from("content_pages").update({ published:Boolean(input.published), updated_by:userId }).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "content.block.update") {
      const result = await supabase.from("content_blocks").update({
        content: input.content ?? {},
        public_visible: input.public_visible !== false
      }).eq("id", input.id).select("*").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "feature.toggle") {
      if (!["birthday_board_enabled","player_of_match_enabled"].includes(input.key)) throw new Error("Unsupported feature flag.");
      const result = await supabase.from("site_settings").upsert({
        key: input.key,
        value: Boolean(input.enabled),
        updated_by: userId
      }).select("key,value").single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "invite.create") {
      const email = cleanText(input.email, 320).toLowerCase();
      const role = cleanText(input.role, 40);
      if (!email.includes("@") || !["parent_player","admin","manager","photographer","sponsor"].includes(role)) {
        throw new Error("Valid email and role are required.");
      }
      const fullName = cleanText(input.full_name, 140) || null;
      const expiresAt = input.expires_at || new Date(Date.now() + 30*86400000).toISOString();

      const result = await supabase.rpc("create_account_invite", {
        invite_email: email,
        invite_role: role,
        invite_full_name: fullName,
        invite_expires_at: expiresAt
      });

      if (result.error) throw result.error;
      data = { id: result.data, email, role, full_name: fullName, expires_at: expiresAt, email_sent:false };
    } else if (action === "role_transfer.start") {
      const email = cleanText(input.target_email, 320).toLowerCase();
      if (!email.includes("@")) throw new Error("Valid target email is required.");
      const expiresAt = new Date(Date.now() + 72*3600000).toISOString();

      const transfer = await supabase.from("admin_transfer_requests").insert({
        initiated_by:userId,
        target_email:email,
        status:"pending",
        expires_at:expiresAt
      }).select("*").single();
      if (transfer.error) throw transfer.error;

      const invite = await supabase.rpc("create_account_invite", {
        invite_email: email,
        invite_role: "admin",
        invite_full_name: cleanText(input.full_name,140)||null,
        invite_expires_at: expiresAt
      });
      if (invite.error) throw invite.error;

      data = {
        transfer: transfer.data,
        invite: { id: invite.data, email, role:"admin", expires_at:expiresAt },
        email_sent:false,
        current_admin_retained:true
      };
    } else {
      throw new Error("Unsupported admin action.");
    }

    await supabase.from("audit_log").insert({
      actor_user_id:userId,
      action,
      entity_type: action.split(".")[0] || "admin",
      entity_id: input.id || input.event_id || input.player_id || null,
      metadata: { endpoint:"admin-actions" }
    });

    return new Response(JSON.stringify({ ok:true, action, data }), {
      status:200,
      headers:{ ...corsHeaders, "Content-Type":"application/json", "Cache-Control":"no-store" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete action.";
    const status =
      message.includes("Authentication") || message.includes("session") ? 401 :
      message.includes("Admin or manager") || message.includes("Multi-factor") ? 403 : 400;
    return new Response(JSON.stringify({ ok:false, error:message }), {
      status,
      headers:{ ...corsHeaders, "Content-Type":"application/json", "Cache-Control":"no-store" }
    });
  }
});
