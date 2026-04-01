import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "VERY_SECRET_KEY!";

export const checkToken = async (c: Context, next: Next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader) return c.json({ message: "Unauthorized" }, 401);

  // Support both "Bearer <token>" and raw token
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    // The frontend encodes "/" as "slash" in tokens; decode before verifying
    const decoded = jwt.verify(token.replace(/slash/g, "/"), SECRET);
    c.set("decoded", decoded);
    await next();
  } catch (err: any) {
    return c.json({ message: err.message }, 401);
  }
};
