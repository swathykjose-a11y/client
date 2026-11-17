import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATION_SECRET =
  process.env.REVALIDATION_SECRET || process.env.ADMIN_API_SECRET;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace(/^Bearer\s+/i, "") ||
      request.nextUrl.searchParams.get("secret");

    if (REVALIDATION_SECRET && token !== REVALIDATION_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let paths: string[] = ["/", "/products"];
    let tags: string[] = [];

    try {
      const body = await request.json();
      if (body?.paths && Array.isArray(body.paths)) {
        paths = body.paths;
      }
      if (body?.tags && Array.isArray(body.tags)) {
        tags = body.tags;
      }
    } catch {
      // Body is optional
    }

    for (const p of paths) {
      revalidatePath(p);
    }

    for (const t of tags) {
      revalidateTag(t);
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      tags,
      now: Date.now(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 },
    );
  }
}
