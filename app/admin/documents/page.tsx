import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Document, Folder, Organization } from "@/lib/types";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import DeleteDocumentButton from "@/components/DeleteDocumentButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function formatStorageUri(uri?: string) {
  if (!uri) return "-";
  if (uri.startsWith("gs://")) {
    const withoutScheme = uri.slice("gs://".length);
    const parts = withoutScheme.split("/").filter(Boolean);
    if (parts.length <= 1) return parts.join("/");
    return parts.slice(1).join("/");
  }
  return uri;
}

async function getDocuments(
  organizationId?: string,
  folderId?: string,
): Promise<Document[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const url = new URL(`${API_URL}/admin/documents`);
    if (organizationId) {
      url.searchParams.set("organizationId", organizationId);
    }
    if (folderId) {
      url.searchParams.set("folderId", folderId);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn("Failed to fetch documents:", res.status, res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.warn("Error loading documents (API might be down):", error);
    return [];
  }
}

async function getOrganizations(): Promise<Organization[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

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

async function getFolders(): Promise<Folder[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const res = await fetch(`${API_URL}/admin/folders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn("Failed to fetch folders:", res.status, res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.warn("Error loading folders (API might be down):", error);
    return [];
  }
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { organizationId?: string; folderId?: string };
}) {
  const organizationId = searchParams.organizationId;
  const folderId = searchParams.folderId;
  const [documents, organizations, folders] = await Promise.all([
    getDocuments(organizationId, folderId),
    getOrganizations(),
    getFolders(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Documents
        </h1>
        <UploadDocumentModal
          organizations={organizations}
          folders={folders}
          initialOrganizationId={organizationId}
          initialFolderId={folderId}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Path
                </th>
                <th scope="col" className="px-6 py-3">
                  Organization ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No documents found.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const storagePath = formatStorageUri(doc.storage_uri);
                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {doc.filename}
                      </td>
                      <td
                        className="px-6 py-4 truncate max-w-xs"
                        title={storagePath}
                      >
                        {storagePath}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {doc.organization_id}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DeleteDocumentButton documentId={doc.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
