import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Folder, Organization } from "@/lib/types";
import CreateFolderModal from "@/components/CreateFolderModal";
import EditFolderModal from "@/components/EditFolderModal";
import DeleteFolderButton from "@/components/DeleteFolderButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getFolders(organizationId?: string): Promise<Folder[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const url = new URL(`${API_URL}/admin/folders`);
    if (organizationId) {
      url.searchParams.set("organizationId", organizationId);
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
      console.warn("Failed to fetch folders:", res.status, res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.warn("Error loading folders (API might be down):", error);
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

export default async function FoldersPage({
  searchParams,
}: {
  searchParams: { organizationId?: string };
}) {
  const organizationId = searchParams.organizationId;
  const [folders, organizations] = await Promise.all([
    getFolders(organizationId),
    getOrganizations(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Folders
        </h1>
        <CreateFolderModal
          organizations={organizations}
          initialOrganizationId={organizationId}
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
                  Organization ID
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {folders.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No folders found.
                  </td>
                </tr>
              ) : (
                folders.map((folder) => (
                  <tr
                    key={folder.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {folder.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {folder.organization_id}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <EditFolderModal folder={folder} />
                        <DeleteFolderButton folderId={folder.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
