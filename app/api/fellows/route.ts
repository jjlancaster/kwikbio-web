import { NextResponse } from "next/server";

// TODO: wire email notification (e.g. Resend/SendGrid) and persist to DB / CRM
// TODO: send confirmation email to applicant
// TODO: notify team Slack channel on new application

export async function POST(req: Request) {
  let body: Record<string, string> = {};

  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = String(value);
      });
    } else {
      return NextResponse.json(
        { ok: false, error: "unsupported_content_type" },
        { status: 415 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 }
    );
  }

  const { name, email, institution, research_domain, open_question } = body;

  // Basic validation
  if (!name?.trim()) {
    return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });
  }
  if (!email?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (!institution?.trim()) {
    return NextResponse.json({ ok: false, error: "institution_required" }, { status: 400 });
  }
  if (!research_domain?.trim()) {
    return NextResponse.json({ ok: false, error: "research_domain_required" }, { status: 400 });
  }
  if (!open_question?.trim()) {
    return NextResponse.json({ ok: false, error: "open_question_required" }, { status: 400 });
  }

  // Stub: log to console (replace with DB insert / email send in Day-2 wiring)
  console.log("[fellows/apply]", {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    institution: institution.trim(),
    research_domain: research_domain.trim(),
    open_question: open_question.trim(),
    submitted_at: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    message: "Application received. We'll be in touch.",
  });
}
