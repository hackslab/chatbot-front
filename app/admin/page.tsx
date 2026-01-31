import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getDashboardStats() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return {
        organizations: null,
        applications: null,
        documents: null,
        folders: null,
      };
    }

    const headers = { Authorization: `Bearer ${token}` };

    const [orgRes, appRes, docRes, folderRes] = await Promise.all([
      fetch(`${API_URL}/admin/organizations`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/admin/applications`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/admin/documents`, { headers, cache: "no-store" }),
      fetch(`${API_URL}/admin/folders`, { headers, cache: "no-store" }),
    ]);

    if (
      orgRes.status === 401 ||
      appRes.status === 401 ||
      docRes.status === 401 ||
      folderRes.status === 401
    ) {
      redirect("/");
    }

    const [orgs, apps, docs, folders] = await Promise.all([
      orgRes.ok ? orgRes.json() : Promise.resolve([]),
      appRes.ok ? appRes.json() : Promise.resolve([]),
      docRes.ok ? docRes.json() : Promise.resolve([]),
      folderRes.ok ? folderRes.json() : Promise.resolve([]),
    ]);

    return {
      organizations: orgRes.ok ? orgs.length : null,
      applications: appRes.ok ? apps.length : null,
      documents: docRes.ok ? docs.length : null,
      folders: folderRes.ok ? folders.length : null,
    };
  } catch (error) {
    console.warn("Failed to load dashboard stats:", error);
    return {
      organizations: null,
      applications: null,
      documents: null,
      folders: null,
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const items = [
    { label: "Organizations", value: stats.organizations },
    { label: "Applications", value: stats.applications },
    { label: "Documents", value: stats.documents },
    { label: "Folders", value: stats.folders },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Dashboard
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md"
          >
            <dt className="truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {item.label}
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              {item.value ?? "--"}
            </dd>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Welcome to Chat SaaS Admin
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Select a category from the sidebar to manage your resources. This
          admin panel allows you to configure specific tenants, manage documents
          for RAG, and set up AI applications.
        </p>
      </div>
    </div>
  );
}
