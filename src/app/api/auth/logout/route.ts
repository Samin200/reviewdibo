export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout
 * Clear the auth_token cookie.
 */
export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    "auth_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
  );
  return response;
}
