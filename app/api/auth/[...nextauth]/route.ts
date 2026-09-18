import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

// The pg adapter runs on node-postgres, which is not edge-compatible.
export const runtime = "nodejs";
