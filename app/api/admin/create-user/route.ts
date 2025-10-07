import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

const getAuthUserIdByEmail = async (email: string): Promise<string | null> => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error fetching users from auth:", error);
      return null;
    }

    const user = data?.find((u: { email: string }) => u.email === email);
    return user ? user.id : null;
  } catch (err) {
    console.error("💥 Error in getAuthUserIdByEmail:", err);
    return null;
  }
};

export async function POST(req: Request) {
  try {
    const { email, organizationId } = await req.json();

    if (!email || !organizationId) {
      return NextResponse.json(
        { error: "Missing email or organizationId" },
        { status: 400 }
      );
    }

    const existingUserId = await getAuthUserIdByEmail(email);
    if (existingUserId) {
      return NextResponse.json(
        { error: "User already exists in auth" },
        { status: 400 }
      );
    }

    const password = Math.random().toString(36).slice(-10);
    let userId = "";

    const { data, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (userError || !data?.user?.id) {
      console.error("❌ Error creating user:", userError);
      return NextResponse.json(
        { error: "User exists in different organization" },
        { status: 500 }
      );
    }

    userId = data.user.id;

    const { error: linkError } = await supabaseAdmin
      .from("organization_users")
      .insert({
        organization_id: organizationId,
        user_id: userId,
        email,
        password,
      });

    if (linkError) {
      console.error("❌ Insert into organization_users error:", linkError);
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    return NextResponse.json({
      email,
      password,
    });
  } catch (err: any) {
    console.error("💥 Server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
