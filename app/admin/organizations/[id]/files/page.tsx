import { notFound } from "next/navigation";
import OrganizationDetailsView from "../organization-details-view";
import {
  getAiModels,
  getApplications,
  getDocuments,
  getFolders,
  getOrganization,
  getStorageUsage,
} from "../organization-data";

export default async function OrganizationFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [org, applications, aiModels, folders, documents, storageUsage] =
    await Promise.all([
      getOrganization(id),
      getApplications(),
      getAiModels(),
      getFolders(id),
      getDocuments(id),
      getStorageUsage(id),
    ]);

  if (!org) {
    notFound();
  }

  return (
    <OrganizationDetailsView
      org={org}
      applications={applications}
      aiModels={aiModels}
      folders={folders}
      documents={documents}
      storageUsage={storageUsage}
    />
  );
}
