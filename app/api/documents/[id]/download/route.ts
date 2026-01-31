import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/admin/documents/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: res.status },
      );
    }

    // Pass through Content-Type and Content-Disposition
    const headers = new Headers();
    if (res.headers.get("Content-Type")) {
      headers.set("Content-Type", res.headers.get("Content-Type")!);
    }
    if (res.headers.get("Content-Disposition")) {
      headers.set(
        "Content-Disposition",
        res.headers.get("Content-Disposition")!,
      );
    }
    if (res.headers.get("Content-Length")) {
      headers.set("Content-Length", res.headers.get("Content-Length")!);
    }

    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Download Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
