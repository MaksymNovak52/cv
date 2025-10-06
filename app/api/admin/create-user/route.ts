import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, organizationId } = await req.json();

    if (!email || !organizationId) {
      return NextResponse.json(
        { error: "Missing email or organizationId" },
        { status: 400 }
      );
    }

    const password = Math.random().toString(36).slice(-10);

    const { data, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    let userId = data?.user?.id;
    let isNewUser = true;

    if (userError?.message?.includes("already registered") || !userId) {
      console.warn("⚠️ User already exists, fetching ID...");

      const { data: list, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        console.error("❌ List users error:", listError);
        return NextResponse.json(
          { error: "Could not fetch existing user" },
          { status: 500 }
        );
      }

      const existing = list.users.find((u) => u.email === email);
      if (!existing) {
        return NextResponse.json(
          { error: "User not found in auth" },
          { status: 404 }
        );
      }
      userId = existing.id;
      isNewUser = false;
    }

    const { error: linkError } = await supabaseAdmin
      .from("organization_users")
      .insert({
        organization_id: organizationId,
        user_id: userId,
        email,
        password: isNewUser ? password : null,
      });

    if (linkError) {
      console.error("Insert link error:", linkError);
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    return NextResponse.json({
      email,
      password: isNewUser ? password : undefined,
    });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
