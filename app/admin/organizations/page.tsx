import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Organization } from "@/lib/types";
import OrganizationsViewSwitcher from "@/components/OrganizationsViewSwitcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getOrganizations(): Promise<Organization[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    // Return empty if no token (user might need to login, or handled by middleware)
    if (!token) return [];

    const res = await fetch(`${API_URL}/admin/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn(
        "Failed to fetch organizations:",
        res.status,
        res.statusText,
      );
      return [];
    }
    return res.json();
  } catch (error) {
    console.warn("Error loading organizations (API might be down):", error);
    return [];
  }
}

export default async function OrganizationsPage() {
  const organizations = await getOrganizations();

  return (
    <OrganizationsViewSwitcher organizations={organizations} />
  );
}
