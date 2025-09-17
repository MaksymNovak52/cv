import { supabase } from "@/lib/supabase";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Auth error:", error);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, is_admin")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Profile error:", profileError);
    return null;
  }

  return profile;
}
