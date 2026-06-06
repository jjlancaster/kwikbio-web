import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

export const runtime = "nodejs";
// SSE proxying requires a streaming, non-static response.
export const dynamic = "force-dynamic";

const GATEWAY =
  process.env.ARS_GATEWAY_INTERNAL ?? "http://127.0.0.1:5000";
// Path on the ARS Gateway. Defaults to /ars-query — confirm with Hydro.
const GATEWAY_PATH = process.env.ARS_GATEWAY_QUERY_PATH ?? "/ars-query";
const ANON_LIMIT = Number(
  process.env.NEXT_PUBLIC_ARS_RATE_LIMIT_ANONYMOUS ?? "1",
);
const ANON_COOKIE = "ars_anon_count";
const TIMEOUT_MS = 35_000;

const enc = new TextEncoder();
function sse(obj: unknown): Uint8Array {
  return enc.encode(`data: ${JSON.stringify(obj)}\n\n`);
}

function fallbackEvent() {
  return {
    status: "complete" as const,
    fallback: true,
    message:
      "The live ARS engine isn't reachable from here right now. Your question is valid — create a free account and we'll run the full PRISM-9 reduction the moment the Gateway is online.",
    prism9: { entities: [], relations: {} },
    hypotheses: { ranked: [] },
    experiments: { suggestions: [] },
  };
}

export async function POST(req: Request) {
  let question = "";
  let sessionId: string | undefined;
  try {
    const body = await req.json();
    question = String(body?.question ?? "").trim();
    sessionId = body?.sessionId ? String(body.sessionId) : undefined;
  } catch {
    return Response.json(
      { status: "error", error: "invalid_json" },
      { status: 400 },
    );
  }
  if (!question) {
    return Response.json(
      { status: "error", error: "empty_question" },
      { status: 400 },
    );
  }

  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  const authed = token ? (await verifyToken(token)) !== null : false;

  // Anonymous rate limit (cookie-based, per spec "1 query / IP via cookie").
  let anonCount = 0;
  if (!authed) {
    anonCount = Number(jar.get(ANON_COOKIE)?.value ?? "0") || 0;
    if (anonCount >= ANON_LIMIT) {
      return Response.json(
        {
          status: "limit",
          message: `You've used your ${ANON_LIMIT} free quer${ANON_LIMIT === 1 ? "y" : "ies"}. Create a free account to keep exploring.`,
        },
        { status: 429 },
      );
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        sse({
          status: "running",
          stage: "prism9",
          message: "Running PRISM-9 reduction… (10–30 seconds)",
        }),
      );

      const ac = new AbortController();
      const timeout = setTimeout(() => ac.abort(), TIMEOUT_MS);
      try {
        const upstream = await fetch(`${GATEWAY}${GATEWAY_PATH}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "text/event-stream",
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ question, sessionId }),
          signal: ac.signal,
        });

        if (!upstream.ok || !upstream.body) {
          controller.enqueue(sse(fallbackEvent()));
        } else {
          // Pass the Gateway's SSE bytes straight through.
          const reader = upstream.body.getReader();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) controller.enqueue(value);
          }
        }
      } catch {
        // Never surface a raw error — emit a graceful, honest fallback.
        controller.enqueue(sse(fallbackEvent()));
      } finally {
        clearTimeout(timeout);
        controller.close();
      }
    },
  });

  const headers = new Headers({
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
  });

  // Count this anonymous query (set the cookie explicitly on the stream response).
  if (!authed) {
    const parts = [
      `${ANON_COOKIE}=${anonCount + 1}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=86400",
    ];
    if (process.env.NODE_ENV === "production") parts.push("Secure");
    headers.append("set-cookie", parts.join("; "));
  }

  return new Response(stream, { headers });
}
