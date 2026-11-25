import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || "";

function secretsMatch(presented: string, expected: string): boolean {
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function allowedPath(path: string): boolean {
  if (path === "/") return true;
  return /^\/(products|collections|policies|cart|checkout)(\/[a-z0-9-]+)?$/i.test(path);
}

export async function POST(request: NextRequest) {
  try {
    if (REVALIDATION_SECRET.length < 24) {
      return NextResponse.json({ error: "Revalidation is not configured" }, { status: 503 });
    }

    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    if (!token || !secretsMatch(token, REVALIDATION_SECRET)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let paths: string[] = ["/", "/products"];
    let tags: string[] = [];

    try {
      const body = await request.json();
      if (body?.paths && Array.isArray(body.paths)) {
        paths = body.paths.filter((path: unknown): path is string => typeof path === "string");
      }
      if (body?.tags && Array.isArray(body.tags)) {
        tags = body.tags.filter((tag: unknown): tag is string => typeof tag === "string" && /^[a-z0-9:_-]{1,64}$/i.test(tag));
      }
    } catch {
      // Body is optional
    }

    if (paths.length === 0 || paths.length > 20 || paths.some((path) => !allowedPath(path))) {
      return NextResponse.json({ error: "Path is not allowed" }, { status: 400 });
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    for (const tag of tags.slice(0, 20)) {
      revalidateTag(tag, "max");
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      tags,
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
