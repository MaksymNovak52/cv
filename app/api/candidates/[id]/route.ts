import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const candidateId = params.id;

  try {
    const { data: applications, error: appError } = await supabase
      .from("applications")
      .select("id")
      .eq("candidate_id", candidateId);

    if (appError) throw appError;

    const applicationIds = applications?.map((a) => a.id) || [];

    if (applicationIds.length > 0) {
      const { error: notesError } = await supabase
        .from("application_notes")
        .delete()
        .in("application_id", applicationIds);
      if (notesError) throw notesError;
    }

    const { error: skillsError } = await supabase
      .from("candidate_skills")
      .delete()
      .eq("candidate_id", candidateId);
    if (skillsError) throw skillsError;

    const { error: appDelError } = await supabase
      .from("applications")
      .delete()
      .eq("candidate_id", candidateId);
    if (appDelError) throw appDelError;

    const { error: candidateError } = await supabase
      .from("candidates")
      .delete()
      .eq("id", candidateId);
    if (candidateError) throw candidateError;

    return NextResponse.json({
      success: true,
      message: `Candidate ${candidateId} deleted successfully`,
    });
  } catch (error: any) {
    console.error("❌ Error deleting candidate:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
