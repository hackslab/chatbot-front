import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  AiModel,
  Application,
  AssignedDocument,
  Document,
  Folder,
  Organization,
} from "@/lib/types";
import ApiKeyCard from "@/components/ApiKeyCard";
import BotTokenCard from "@/components/BotTokenCard";
import AssignDocumentsModal from "@/components/AssignDocumentsModal";
import RemoveAssignedDocumentButton from "@/components/RemoveAssignedDocumentButton";
import EditApplicationModal from "@/components/EditApplicationModal";
import DeleteApplicationButton from "@/components/DeleteApplicationButton";
import TestChatbotCard from "@/components/TestChatbotCard";
import {
  formatApplicationType,
  resolveApplicationType,
} from "@/lib/application";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"; // Import icons

function StatusBadge({
  status,
  error,
}: {
  status?: string;
  error?: string | null;
}) {
  if (!status || status === "PENDING" || status === "INDEXING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        {status === "INDEXING" ? "Indexing" : "Pending"}
      </span>
    );
  }
  if (status === "READY" || status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        {status === "ACTIVE" ? "Active" : "Ready"}
      </span>
    );
  }
  if (status === "ERROR") {
    return (
      <span
        title={error || "Unknown error"}
        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400 cursor-help"
      >
        <AlertCircle className="h-3 w-3" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {status}
    </span>
  );
}

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

async function getApplication(id: string): Promise<Application | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return null;

    const res = await fetch(`${API_URL}/admin/applications/${id}`, {
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
      console.warn(`Failed to fetch application ${id}:`, res.status);
      return null;
    }

    return res.json();
  } catch (error) {
    console.warn(`Error loading application ${id}:`, error);
    return null;
  }
}

async function getAssignedDocuments(id: string): Promise<AssignedDocument[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const res = await fetch(`${API_URL}/admin/applications/${id}/documents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn(`Failed to fetch assigned documents for ${id}:`, res.status);
      return [];
    }

    return res.json();
  } catch (error) {
    console.warn(`Error loading assigned documents ${id}:`, error);
    return [];
  }
}

async function getDocuments(organizationId: string): Promise<Document[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const url = new URL(`${API_URL}/admin/documents`);
    url.searchParams.set("organizationId", organizationId);

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

async function getFolders(organizationId: string): Promise<Folder[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const url = new URL(`${API_URL}/admin/folders`);
    url.searchParams.set("organizationId", organizationId);

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

export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  const [assignedDocuments, documents, organizations, aiModels, folders] =
    await Promise.all([
      getAssignedDocuments(id),
      getDocuments(application.organization_id),
      getOrganizations(),
      getAiModels(),
      getFolders(application.organization_id),
    ]);

  const assignedIds = assignedDocuments.map((doc) => doc.id);
  const resolvedType = resolveApplicationType(application);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/applications"
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {application.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Application Name:{" "}
              <span className="font-medium">{application.name}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditApplicationModal
            application={application}
            organizations={organizations}
            aiModels={aiModels}
            iconOnly
          />
          <DeleteApplicationButton
            applicationId={application.id}
            iconOnly
            redirectTo={`/admin/organizations/${application.organization_id}`}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Configuration
          </h2>
          <dl className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Organization
              </dt>
              <dd className="col-span-2 font-medium text-zinc-900 dark:text-zinc-100">
                {organizations.find((o) => o.id === application.organization_id)
                  ?.name || application.organization_id}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Status
              </dt>
              <dd className="col-span-2 text-zinc-900 dark:text-zinc-100">
                <StatusBadge status={application.status} />
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                AI Model
              </dt>
              <dd className="col-span-2 font-medium text-zinc-900 dark:text-zinc-100">
                {aiModels.find((m) => m.id === application.ai_model_id)?.name ||
                  application.ai_model_id}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Channel
              </dt>
              <dd className="col-span-2 font-medium text-zinc-900 dark:text-zinc-100">
                {formatApplicationType(resolvedType)}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Temperature
              </dt>
              <dd className="col-span-2 text-zinc-900 dark:text-zinc-100">
                {application.temperature}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                System Prompt
              </dt>
              <dd className="col-span-2 whitespace-pre-line text-zinc-900 dark:text-zinc-100">
                {application.system_prompt}
              </dd>
            </div>
          </dl>
        </div>

        {resolvedType === "API" ? (
          <ApiKeyCard
            applicationId={application.id}
            apiKey={application.api_key ?? undefined}
          />
        ) : resolvedType === "TELEGRAM_BOT" ? (
          <BotTokenCard
            application={application}
            organizations={organizations}
            aiModels={aiModels}
          />
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Channel Credentials
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Credentials for this channel are not configurable yet.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Knowledge Base
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Assign documents to power retrieval for this application.
              </p>
            </div>
            <AssignDocumentsModal
              applicationId={application.id}
              documents={documents}
              folders={folders}
              assignedDocumentIds={assignedIds}
              iconOnly
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Storage URI
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {assignedDocuments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-500"
                    >
                      No documents assigned yet.
                    </td>
                  </tr>
                ) : (
                  assignedDocuments.map((doc) => {
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
                          className="px-6 py-4 max-w-xs truncate"
                          title={storagePath}
                        >
                          {storagePath}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={doc.status}
                            error={doc.error_message}
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {doc.mime_type}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <RemoveAssignedDocumentButton
                            applicationId={application.id}
                            documentId={doc.id}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <TestChatbotCard
          applicationId={application.id}
          apiKey={resolvedType === "API" ? application.api_key : null}
        />
      </div>
    </div>
  );
}
