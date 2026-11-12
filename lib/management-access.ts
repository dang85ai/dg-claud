import { supabase } from "@/lib/supabase";

export function errorMessage(error: unknown, fallback = "Unable to complete this action.") {
  return error && typeof error === "object" && "message" in error
    ? String(error.message) : fallback;
}

/** Management modules must verify the user's authenticated role and AAL2. */
export async function requireManager() {
  const user = await supabase.auth.getUser();
  if (user.error || !user.data.user) throw new Error("Please sign in again.");
  const [roles, aal] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.data.user.id),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  ]);
  if (roles.error) throw roles.error;
  if (!(roles.data ?? []).some((row) => row.role === "manager" || row.role === "admin")) {
    throw new Error("Manager access is required.");
  }
  if (aal.error || aal.data.currentLevel !== "aal2") {
    throw new Error("Complete multi-factor authentication first.");
  }
  return user.data.user;
}
