import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return Response.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ detail: "Invalid or expired token" }, { status: 401 });
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user) {
      return Response.json({ detail: "User not found" }, { status: 401 });
    }

    return Response.json(user);
  } catch (err) {
    console.error("GET /api/auth/me failed:", err);
    return Response.json({ detail: "Authentication failed" }, { status: 500 });
  }
}
