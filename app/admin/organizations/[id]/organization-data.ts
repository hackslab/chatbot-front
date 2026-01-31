import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AiModel,
  Application,
  Document,
  Folder,
  Organization,
  OrganizationStorageUsage,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getOrganization(id: string): Promise<Organization | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return null;

    const res = await fetch(`${API_URL}/admin/organizations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn(`Failed to fetch organization ${id}:`, res.status);
      return null;
    }
    return res.json();
  } catch (error) {
    console.warn(`Error loading organization ${id}:`, error);
    return null;
  }
}

export async function getApplications(): Promise<Application[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const res = await fetch(`${API_URL}/admin/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn("Failed to fetch applications:", res.status, res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.warn("Error loading applications (API might be down):", error);
    return [];
  }
}

export async function getFolders(organizationId: string): Promise<Folder[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const res = await fetch(
      `${API_URL}/admin/folders?organizationId=${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn("Failed to fetch folders:", res.status, res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.warn("Error loading folders:", error);
    return [];
  }
}

export async function getDocuments(organizationId: string): Promise<Document[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const res = await fetch(
      `${API_URL}/admin/documents?organizationId=${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn("Failed to fetch documents:", res.status, res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.warn("Error loading documents:", error);
    return [];
  }
}

export async function getAiModels(): Promise<AiModel[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const res = await fetch(`${API_URL}/admin/ai-models`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn("Failed to fetch AI models:", res.status, res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.warn("Error loading AI models (API might be down):", error);
    return [];
  }
}

export async function getStorageUsage(
  organizationId: string,
): Promise<OrganizationStorageUsage | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return null;

    const res = await fetch(
      `${API_URL}/admin/organizations/${organizationId}/storage`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn(
        "Failed to fetch storage usage:",
        res.status,
        res.statusText,
      );
      return null;
    }

    return res.json();
  } catch (error) {
    console.warn("Error loading storage usage:", error);
    return null;
  }
}
