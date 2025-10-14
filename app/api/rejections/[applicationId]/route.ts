import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: { applicationId: string } }
) {
  const { data, error } = await supabase
    .from("application_notes")
    .select(
      `
      id,
      content,
      created_at,
      users:author_id (
        email,
        full_name
      )
    `
    )
    .eq("application_id", params.applicationId)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 400 });

  const comments = data.map(
    (n: { id: string; content: string; created_at: string; users: any }) => ({
      id: n.id,
      content: n.content,
      created_at: n.created_at,
      author_name: n.users?.full_name || "Anonymous",
      author_email: n.users?.email || "No email",
    })
  );

  return Response.json(comments);
}
