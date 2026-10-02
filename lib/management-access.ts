import { supabase } from "@/lib/supabase";
import { teamSquad } from "@/lib/team-squad";

export function errorMessage(error: unknown, fallback = "Unable to complete this action.") {
  return error && typeof error === "object" && "message" in error ? String(error.message) : fallback;
}

export async function requireManager() {
  const user = await supabase.auth.getUser();
  if (user.error || !user.data.user) throw new Error("Please sign in again.");
  const [roles, aal] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.data.user.id),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  ]);
  if (roles.error) throw roles.error;
  if (!(roles.data ?? []).some((row) => ["manager", "admin"].includes(row.role))) throw new Error("Manager access is required.");
  if (aal.error || aal.data.currentLevel !== "aal2") throw new Error("Complete multi-factor authentication first.");
  return user.data.user;
}

export async function resolveSquadPlayer(choice: string) {
  await requireManager();
  if (!choice.startsWith("squad:")) return choice;
  const member = teamSquad.find((row) => "squad:" + row.name === choice);
  if (!member) throw new Error("Choose a current squad member.");
  const found = await supabase.from("players").select("id,first_name,active").ilike("first_name", member.name);
  if (found.error) throw found.error;
  if ((found.data ?? []).length > 1) throw new Error("Multiple players have this first name. Select the exact existing record instead.");
  if (found.data?.length) {
    if (!found.data[0].active) throw new Error("This player is inactive. Reactivate the existing record before linking.");
    return String(found.data[0].id);
  }
  // Fixed squad IDs make retries safe without replacing existing player details.
  const saved = await supabase.from("players").upsert({
    id: member.recordId, first_name: member.name, last_name: "", jersey_number: member.number, active: true
  }, { onConflict: "id", ignoreDuplicates: true });
  if (saved.error) throw saved.error;
  const verified = await supabase.from("players").select("id,active").eq("id", member.recordId).single();
  if (verified.error) throw verified.error;
  if (!verified.data.active) throw new Error("This squad record is inactive.");
  return String(verified.data.id);
}
