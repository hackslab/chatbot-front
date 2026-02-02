"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateFolderDto,
  UpdateFolderDto,
  CreateApplicationDto,
  UpdateApplicationDto,
  CreateAiModelDto,
  UpdateAiModelDto,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

async function handleUnauthorized(res: Response) {
  if (res.status === 401) {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    redirect("/");
  }
}

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

export async function createOrganization(data: CreateOrganizationDto) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/organizations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to create organization"),
      };
    }

    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (err) {
    console.error("Create Org Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function deleteOrganization(id: string) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/organizations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to delete organization"),
      };
    }

    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (err) {
    console.error("Delete Org Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function updateOrganization(
  id: string,
  data: UpdateOrganizationDto,
) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/organizations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to update organization"),
      };
    }

    revalidatePath(`/admin/organizations/${id}`);
    revalidatePath(`/admin/organizations/${id}/applications`);
    revalidatePath(`/admin/organizations/${id}/files`);
    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (err) {
    console.error("Update Org Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function createFolder(data: CreateFolderDto) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/folders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return { error: await parseErrorMessage(res, "Failed to create folder") };
    }

    revalidatePath("/admin/folders");
    revalidatePath(`/admin/organizations/${data.organizationId}/files`);
    return { success: true };
  } catch (err) {
    console.error("Create Folder Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function updateFolder(id: string, data: UpdateFolderDto) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/folders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return { error: await parseErrorMessage(res, "Failed to update folder") };
    }

    revalidatePath("/admin/folders");
    return { success: true };
  } catch (err) {
    console.error("Update Folder Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function deleteFolder(id: string) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/folders/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return { error: await parseErrorMessage(res, "Failed to delete folder") };
    }

    revalidatePath("/admin/folders");
    return { success: true };
  } catch (err) {
    console.error("Delete Folder Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function uploadDocument(formData: FormData) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to upload document"),
      };
    }

    revalidatePath("/admin/documents");
    const organizationId = formData.get("organizationId");
    if (typeof organizationId === "string" && organizationId) {
      revalidatePath(`/admin/organizations/${organizationId}/files`);
    }
    return { success: true };
  } catch (err) {
    console.error("Upload Document Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function deleteDocument(id: string) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/documents/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to delete document"),
      };
    }

    revalidatePath("/admin/documents");
    return { success: true };
  } catch (err) {
    console.error("Delete Document Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function createApplication(data: CreateApplicationDto) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to create application"),
      };
    }

    const created = await res.json();
    revalidatePath("/admin/applications");
    if (data.organization_id) {
      revalidatePath(
        `/admin/organizations/${data.organization_id}/applications`,
      );
    }
    return { success: true, application: created };
  } catch (err) {
    console.error("Create Application Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function createAiModel(data: CreateAiModelDto) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/ai-models`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to create AI model"),
      };
    }

    const created = await res.json();
    revalidatePath("/admin/ai-models");
    revalidatePath("/admin/applications");
    return { success: true, aiModel: created };
  } catch (err) {
    console.error("Create AI Model Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function updateAiModel(id: string, data: UpdateAiModelDto) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/ai-models/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to update AI model"),
      };
    }

    revalidatePath("/admin/ai-models");
    revalidatePath("/admin/applications");
    return { success: true };
  } catch (err) {
    console.error("Update AI Model Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function deleteAiModel(id: string) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/ai-models/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to delete AI model"),
      };
    }

    revalidatePath("/admin/ai-models");
    revalidatePath("/admin/applications");
    return { success: true };
  } catch (err) {
    console.error("Delete AI Model Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function updateApplication(
  id: string,
  data: UpdateApplicationDto,
) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/applications/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to update application"),
      };
    }

    revalidatePath(`/admin/applications/${id}`);
    revalidatePath("/admin/applications");
    if (data.organization_id) {
      revalidatePath(
        `/admin/organizations/${data.organization_id}/applications`,
      );
      revalidatePath(
        `/admin/organizations/${data.organization_id}/applications/${id}`,
      );
    }
    return { success: true };
  } catch (err) {
    console.error("Update Application Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function deleteApplication(id: string) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/applications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to delete application"),
      };
    }

    revalidatePath("/admin/applications");
    return { success: true };
  } catch (err) {
    console.error("Delete Application Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function regenerateApiKey(id: string) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(
      `${API_URL}/admin/applications/${id}/regenerate-key`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to regenerate key"),
      };
    }

    const updated = await res.json();
    revalidatePath(`/admin/applications/${id}`);
    revalidatePath("/admin/applications");
    return { success: true, apiKey: updated.api_key };
  } catch (err) {
    console.error("Regenerate Api Key Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function assignDocumentsToApplication(
  id: string,
  documentIds: string[],
) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/admin/applications/${id}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ documentIds }),
    });

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to assign documents"),
      };
    }

    revalidatePath(`/admin/applications/${id}`);
    return { success: true };
  } catch (err) {
    console.error("Assign Documents Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function removeDocumentFromApplication(
  id: string,
  documentId: string,
) {
  const token = await getAdminToken();

  if (!token) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(
      `${API_URL}/admin/applications/${id}/documents/${documentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await handleUnauthorized(res);

    if (!res.ok) {
      return {
        error: await parseErrorMessage(res, "Failed to remove document"),
      };
    }

    revalidatePath(`/admin/applications/${id}`);
    return { success: true };
  } catch (err) {
    console.error("Remove Document Error:", err);
    return { error: "Failed to connect to server" };
  }
}

export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      return { error: await parseErrorMessage(res, "Invalid credentials") };
    }

    const data = await res.json();

    if (data.access_token) {
      const cookieStore = await cookies();
      cookieStore.set("admin_token", data.access_token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === "production",
      });
    } else {
      return { error: "No access token received" };
    }
  } catch (err) {
    console.error("Login Error:", err);
    return { error: "Failed to connect to server" };
  }

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/");
}
