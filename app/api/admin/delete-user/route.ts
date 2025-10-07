import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);
export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();

    const { error: orgUsersError } = await supabaseAdmin
      .from("organization_users")
      .delete()
      .eq("user_id", userId);

    if (orgUsersError) {
      console.error(
        "❌ Error deleting from organization_users:",
        orgUsersError
      );
      return NextResponse.json(
        { error: orgUsersError.message },
        { status: 500 }
      );
    }

    const { error: appsError } = await supabaseAdmin
      .from("applications")
      .delete()
      .eq("candidate_id", userId);

    if (appsError) {
      console.error("❌ Error deleting from applications:", appsError);
      return NextResponse.json({ error: appsError.message }, { status: 500 });
    }

    const { error: jobsError } = await supabaseAdmin
      .from("jobs")
      .delete()
      .eq("organization_id", userId);

    if (jobsError) {
      console.error("❌ Error deleting from jobs:", jobsError);
      return NextResponse.json({ error: jobsError.message }, { status: 500 });
    }

    const { error: profilesError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profilesError) {
      console.error("❌ Error deleting from profiles:", profilesError);
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
    }

    const { error: candidatesError } = await supabaseAdmin
      .from("candidates")
      .delete()
      .eq("id", userId);

    if (candidatesError) {
      console.error("❌ Error deleting from candidates:", candidatesError);
      return NextResponse.json(
        { error: candidatesError.message },
        { status: 500 }
      );
    }

    const { error: usersError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (usersError) {
      console.error("❌ Error deleting from users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("❌ Error deleting user from auth:", deleteAuthError);
      return NextResponse.json(
        { error: deleteAuthError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 Error during deletion:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
