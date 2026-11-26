import { headersFile } from "@/lib/security-headers";

// Next ignores headers() in a static export, so the same headers go out as Cloudflare's `_headers`
// file (STATE D-89). The folder is `%5Fheaders` because a leading `_` makes a folder private.
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(headersFile, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
