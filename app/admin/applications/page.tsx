import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { AiModel, Application, Organization } from "@/lib/types";
import CreateApplicationModal from "@/components/CreateApplicationModal";
import EditApplicationModal from "@/components/EditApplicationModal";
import DeleteApplicationButton from "@/components/DeleteApplicationButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getApplications(): Promise<Application[]> {
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

async function getAiModels(): Promise<AiModel[]> {
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

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { organizationId?: string };
}) {
  const organizationId = searchParams.organizationId;
  const [applications, organizations, aiModels] = await Promise.all([
    getApplications(),
    getOrganizations(),
    getAiModels(),
  ]);
  const filteredApplications = organizationId
    ? applications.filter((app) => app.organization_id === organizationId)
    : applications;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Applications
        </h1>
        <CreateApplicationModal
          organizations={organizations}
          aiModels={aiModels}
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
                  Model ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Organization ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Temp
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No applications found.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {app.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {app.ai_model_id}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {app.organization_id}
                    </td>
                    <td className="px-6 py-4">{app.temperature}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                          title="View application"
                          aria-label="View application"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <EditApplicationModal
                          application={app}
                          organizations={organizations}
                          aiModels={aiModels}
                          iconOnly
                        />
                        <DeleteApplicationButton applicationId={app.id} iconOnly />
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
