import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function parseErrorMessage(res: Response, fallback: string) {
  const text = await res.text();
  if (!text) return fallback;
  try {
    const json = JSON.parse(text);
    const message = json.message ?? json.error ?? text;
    if (Array.isArray(message)) return message.join(", ");
    return message;
  } catch {
    return text;
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    // Forward the request to the backend
    const res = await fetch(`${API_URL}/admin/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await parseErrorMessage(res, "Failed to upload document");
      return NextResponse.json({ error }, { status: res.status });
    }

    // Revalidate paths
    revalidatePath("/admin/documents");
    const organizationId = formData.get("organizationId");
    if (typeof organizationId === "string" && organizationId) {
      revalidatePath(`/admin/organizations/${organizationId}/files`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Upload Document Error:", err);
    return NextResponse.json(
      { error: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
