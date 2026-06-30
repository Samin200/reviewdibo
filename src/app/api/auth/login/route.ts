import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password.trim() : "";

    if (!email || !password) {
      return Response.json(
        { detail: "Email and password are required" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user || !user.passwordHash) {
      return Response.json(
        { detail: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return Response.json(
        { detail: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "user" | "admin",
    });

    const response = Response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    response.headers.set(
      "Set-Cookie",
      `auth_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${
        60 * 60 * 24 * 7
      }`
    );

    return response;
  } catch (err) {
    console.error("POST /api/auth/login failed:", err);
    return Response.json({ detail: "Login failed" }, { status: 500 });
  }
}
