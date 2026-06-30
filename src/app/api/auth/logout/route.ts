export const dynamic = "force-dynamic";

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    "auth_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
  );
  return response;
}
