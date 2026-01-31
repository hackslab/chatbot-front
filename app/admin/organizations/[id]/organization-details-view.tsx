import Link from "next/link";
import {
  AiModel,
  Application,
  Document,
  Folder,
  Organization,
  OrganizationStorageUsage,
} from "@/lib/types";
import EditOrganizationModal from "@/components/EditOrganizationModal";
import OrganizationApplicationsSection from "@/components/OrganizationApplicationsSection";
import OrganizationFilesSection from "@/components/OrganizationFilesSection";
import OrganizationTabsWrapper from "@/components/OrganizationTabsWrapper";

type OrganizationDetailsViewProps = {
  org: Organization;
  applications: Application[];
  aiModels: AiModel[];
  folders: Folder[];
  documents: Document[];
  storageUsage: OrganizationStorageUsage | null;
};

export default function OrganizationDetailsView({
  org,
  applications,
  aiModels,
  folders,
  documents,
  storageUsage,
}: OrganizationDetailsViewProps) {
  const orgApplications = applications.filter(
    (application) => application.organization_id === org.id,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/organizations"
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Organization: {org.name}
          </h1>
        </div>
        <EditOrganizationModal organization={org} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Details
        </h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              ID
            </dt>
            <dd className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
              {org.id}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Slug
            </dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{org.slug}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Contact
            </dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {org.contact_info || "-"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Status
            </dt>
            <dd>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  org.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {org.is_active ? "Active" : "Inactive"}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <OrganizationTabsWrapper
        organizationId={org.id}
        applicationsContent={
          <OrganizationApplicationsSection
            organizationId={org.id}
            applications={orgApplications}
            organizations={[org]}
            aiModels={aiModels}
            initialOrganizationId={org.id}
          />
        }
        filesContent={
          <OrganizationFilesSection
            organizationId={org.id}
            folders={folders}
            documents={documents}
            organizations={[org]}
            storageUsage={storageUsage}
          />
        }
      />
    </div>
  );
}
