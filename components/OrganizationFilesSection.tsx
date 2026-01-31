"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Inbox,
  Search,
  X,
} from "lucide-react";
import {
  Document,
  Folder as FolderType,
  Organization,
  OrganizationStorageUsage,
} from "@/lib/types";
import { uploadDocument } from "@/lib/actions";
import CreateFolderModal from "@/components/CreateFolderModal";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import EditFolderModal from "@/components/EditFolderModal";
import DeleteFolderButton from "@/components/DeleteFolderButton";
import DeleteDocumentButton from "@/components/DeleteDocumentButton";

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".json",
  ".xml",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".tsv",
  ".rtf",
  ".odt",
  ".ods",
  ".odp",
  ".ppt",
  ".pptx",
];
const ALLOWED_EXTENSIONS_LABEL = ALLOWED_EXTENSIONS.join(", ");
const MAX_ORG_STORAGE_LABEL = "20MB";

type OrganizationFilesSectionProps = {
  organizationId: string;
  folders: FolderType[];
  documents: Document[];
  organizations: Organization[];
  storageUsage?: OrganizationStorageUsage | null;
};

export default function OrganizationFilesSection({
  organizationId,
  folders,
  documents,
  organizations,
  storageUsage,
}: OrganizationFilesSectionProps) {
  const router = useRouter();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    completed: number;
    current?: string;
    currentPercent?: number;
  } | null>(null);
  const dragCounter = useRef(0);

  const orgFolders = useMemo(
    () => folders.filter((folder) => folder.organization_id === organizationId),
    [folders, organizationId],
  );
  const orgDocuments = useMemo(
    () => documents.filter((doc) => doc.organization_id === organizationId),
    [documents, organizationId],
  );

  const folderMap = useMemo(
    () => new Map(orgFolders.map((folder) => [folder.id, folder])),
    [orgFolders],
  );

  const documentsByFolderId = useMemo(() => {
    const map = new Map<string, Document[]>();
    orgDocuments.forEach((doc) => {
      if (!doc.folder_id) return;
      const bucket = map.get(doc.folder_id) || [];
      bucket.push(doc);
      map.set(doc.folder_id, bucket);
    });
    return map;
  }, [orgDocuments]);

  const folderDocumentCounts = useMemo(() => {
    const map = new Map<string, number>();
    orgDocuments.forEach((doc) => {
      if (!doc.folder_id) return;
      map.set(doc.folder_id, (map.get(doc.folder_id) ?? 0) + 1);
    });
    return map;
  }, [orgDocuments]);

  const rootDocuments = useMemo(
    () => orgDocuments.filter((doc) => !doc.folder_id),
    [orgDocuments],
  );

  const selectedFolder = selectedFolderId
    ? folderMap.get(selectedFolderId) || null
    : null;

  const selectedDocuments = selectedFolderId
    ? documentsByFolderId.get(selectedFolderId) || []
    : rootDocuments;

  const normalizedQuery = query.trim().toLowerCase();

  const visibleFolders = selectedFolderId
    ? []
    : orgFolders.filter((folder) => {
        if (!normalizedQuery) return true;
        const haystack = `${folder.name} ${folder.id}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });

  const visibleDocuments = selectedDocuments.filter((doc) => {
    if (!normalizedQuery) return true;
    const haystack =
      `${doc.filename} ${doc.mime_type ?? ""} ${doc.storage_uri}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const totalFiles = orgDocuments.length;
  const totalFolders = orgFolders.length;
  const folderFileCount = selectedDocuments.length;
  const rootFileCount = rootDocuments.length;

  function formatDate(value?: string) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  }

  function documentTypeLabel(doc: Document) {
    const parts = doc.filename.split(".");
    if (parts.length > 1) {
      return parts.pop()?.toUpperCase() || "FILE";
    }
    if (doc.mime_type) {
      const mimeParts = doc.mime_type.split("/");
      return mimeParts[mimeParts.length - 1]?.toUpperCase() || "FILE";
    }
    return "FILE";
  }

  function formatBytes(bytes: number) {
    if (!Number.isFinite(bytes) || bytes < 0) return "--";
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    const precision = value >= 100 || unitIndex === 0 ? 0 : value >= 10 ? 1 : 2;
    const formatted = Number(value.toFixed(precision)).toString();
    return `${formatted} ${units[unitIndex]}`;
  }

  const usagePercent =
    storageUsage && storageUsage.limit_bytes > 0
      ? Math.min(
          100,
          (storageUsage.used_bytes / storageUsage.limit_bytes) * 100,
        )
      : 0;
  const usageLabel = storageUsage
    ? `${formatBytes(storageUsage.used_bytes)} of ${formatBytes(storageUsage.limit_bytes)} used`
    : "Storage usage unavailable";
  const usageShortLabel = storageUsage
    ? `${formatBytes(storageUsage.used_bytes)} / ${formatBytes(storageUsage.limit_bytes)}`
    : "Unavailable";
  const usagePercentLabel = storageUsage
    ? `${Math.round(usagePercent)}%`
    : "--";
  const remainingBytes =
    storageUsage && storageUsage.limit_bytes > 0
      ? Math.max(0, storageUsage.limit_bytes - storageUsage.used_bytes)
      : null;

  function fileExtension(name: string) {
    const index = name.lastIndexOf(".");
    return index >= 0 ? name.slice(index).toLowerCase() : "";
  }

  async function handleUploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList || []);
    if (files.length === 0 || isUploading) return;

    setUploadError("");

    const invalidFiles = files.filter(
      (file) => !ALLOWED_EXTENSIONS.includes(fileExtension(file.name)),
    );
    const validFiles = files.filter((file) =>
      ALLOWED_EXTENSIONS.includes(fileExtension(file.name)),
    );

    if (invalidFiles.length > 0) {
      setUploadError(
        `Unsupported files: ${invalidFiles
          .map((file) => file.name)
          .join(", ")}. Allowed: ${ALLOWED_EXTENSIONS_LABEL}.`,
      );
    }

    if (validFiles.length === 0) {
      return;
    }

    if (remainingBytes !== null) {
      const totalBytes = validFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalBytes > remainingBytes) {
        setUploadError(
          `Not enough storage. ${formatBytes(remainingBytes)} remaining, ${formatBytes(totalBytes)} selected.`,
        );
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress({
      total: validFiles.length,
      completed: 0,
      current: validFiles[0]?.name,
    });

    const failures: string[] = [];
    try {
      for (const file of validFiles) {
        setUploadProgress((prev) =>
          prev ? { ...prev, current: file.name, currentPercent: 0 } : prev,
        );

        try {
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/documents/upload");

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = (event.loaded / event.total) * 100;
                setUploadProgress((prev) =>
                  prev ? { ...prev, currentPercent: percent } : prev,
                );
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                try {
                  const response = JSON.parse(xhr.responseText);
                  reject(response.error || "Upload failed");
                } catch {
                  reject(xhr.statusText || "Upload failed");
                }
              }
            };

            xhr.onerror = () => reject("Network error");

            const payload = new FormData();
            payload.append("file", file);
            payload.append("organizationId", organizationId);
            if (selectedFolderId) {
              payload.append("folderId", selectedFolderId);
            }

            xhr.send(payload);
          });
        } catch (error) {
          failures.push(`${file.name}: ${error}`);
        }

        setUploadProgress((prev) =>
          prev
            ? {
                ...prev,
                completed: Math.min(prev.completed + 1, prev.total),
                currentPercent: 100,
              }
            : prev,
        );
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      router.refresh();
    }

    if (failures.length > 0) {
      setUploadError(
        `Failed to upload ${failures.length} file(s): ${failures.join(" | ")}`,
      );
    }
  }

  function isFileDrag(event: React.DragEvent) {
    const types = event.dataTransfer.types;
    if (types && Array.from(types).includes("Files")) return true;
    return event.dataTransfer.files?.length > 0;
  }

  function handleDragEnter(event: React.DragEvent) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  }

  function handleDragOver(event: React.DragEvent) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event: React.DragEvent) {
    if (!isDragging) return;
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }

  function handleDrop(event: React.DragEvent) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    void handleUploadFiles(event.dataTransfer.files);
  }

  const uploadPercent = uploadProgress
    ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Files
            </h2>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              <div
                className="h-1.5 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={storageUsage ? Math.round(usagePercent) : 0}
                aria-label="Storage usage"
              >
                <div
                  className="h-1.5 rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                {usagePercentLabel}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {usageShortLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <UploadDocumentModal
              key={`upload-${selectedFolderId ?? "root"}`}
              organizations={organizations}
              folders={folders}
              initialOrganizationId={organizationId}
              initialFolderId={selectedFolderId ?? undefined}
              storageUsage={storageUsage ?? undefined}
            />
            <CreateFolderModal
              organizations={organizations}
              initialOrganizationId={organizationId}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Root folder: /{organizationId}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Explorer
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
              <HardDrive className="h-4 w-4" />
              Organization storage
            </div>
            <p className="mt-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">
              {organizationId}
            </p>
          </div>

          <div className="mt-4 space-y-4">
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                selectedFolderId === null
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                  : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm dark:bg-zinc-800 dark:text-zinc-300">
                <FolderOpen className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Root</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {totalFolders} folder{totalFolders === 1 ? "" : "s"} ·{" "}
                  {rootFileCount} file{rootFileCount === 1 ? "" : "s"}
                </div>
              </div>
            </button>

            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <span>Folders</span>
                <span>{totalFolders}</span>
              </div>
              <div className="mt-2 space-y-1">
                {orgFolders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-3 py-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    No folders yet.
                  </div>
                ) : (
                  orgFolders.map((folder) => {
                    const count = folderDocumentCounts.get(folder.id) ?? 0;
                    const isActive = selectedFolderId === folder.id;
                    return (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                            : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                          <Folder className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {folder.name}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {count} file{count === 1 ? "" : "s"}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>

        <section
          className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {(isDragging || isUploading) && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-zinc-900/70">
              <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-indigo-300 bg-white/90 px-8 py-6 text-center shadow-lg dark:border-indigo-700 dark:bg-zinc-950/90">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
                  <Inbox className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {isUploading
                      ? "Uploading files"
                      : `Drop files to upload to ${selectedFolder?.name || "Root"}`}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Allowed: {ALLOWED_EXTENSIONS_LABEL}. Max storage per
                    organization: {MAX_ORG_STORAGE_LABEL}.
                  </p>
                </div>
                {isUploading && uploadProgress && (
                  <div className="w-full max-w-xs text-left">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>
                        {uploadProgress.completed} of {uploadProgress.total}
                      </span>
                      <span>
                        {uploadProgress.currentPercent !== undefined
                          ? `${Math.round(uploadProgress.currentPercent)}%`
                          : `${uploadPercent}%`}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-indigo-600 transition-all"
                        style={{
                          width: `${
                            uploadProgress.currentPercent !== undefined
                              ? uploadProgress.currentPercent
                              : uploadPercent
                          }%`,
                        }}
                      />
                    </div>
                    {uploadProgress.current && (
                      <div className="mt-2 truncate text-xs text-zinc-500 dark:text-zinc-400">
                        Uploading: {uploadProgress.current}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Location
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                  <HardDrive className="h-4 w-4" />
                  <span className="font-mono text-xs">{organizationId}</span>
                  {selectedFolder && (
                    <>
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                      <FolderOpen className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">{selectedFolder.name}</span>
                    </>
                  )}
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedFolder ? (
                    <>
                      {folderFileCount} file{folderFileCount === 1 ? "" : "s"}
                    </>
                  ) : (
                    <>
                      {totalFolders} folder{totalFolders === 1 ? "" : "s"} ·{" "}
                      {rootFileCount} file{rootFileCount === 1 ? "" : "s"}
                    </>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                {selectedFolder && (
                  <button
                    type="button"
                    onClick={() => setSelectedFolderId(null)}
                    className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Back to root
                  </button>
                )}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search files and folders"
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-9 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:w-60"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-2 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            {uploadError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                {uploadError}
              </div>
            )}
            {selectedFolder && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                    <FolderOpen className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {selectedFolder.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      ID: {selectedFolder.id} · {folderFileCount} file
                      {folderFileCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <EditFolderModal folder={selectedFolder} iconOnly />
                  <DeleteFolderButton folderId={selectedFolder.id} iconOnly />
                </div>
              </div>
            )}

            <div className="hidden md:grid grid-cols-[minmax(220px,1.4fr)_minmax(140px,1fr)_minmax(90px,0.6fr)_minmax(140px,0.8fr)_auto] gap-3 border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <span>Name</span>
              <span>Location</span>
              <span>Type</span>
              <span>Created</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="mt-3 space-y-2">
              {visibleFolders.map((folder) => {
                const count = folderDocumentCounts.get(folder.id) ?? 0;
                const location = `/${organizationId}/${folder.id}`;
                return (
                  <div
                    key={folder.id}
                    className="grid grid-cols-1 gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 md:grid-cols-[minmax(220px,1.4fr)_minmax(140px,1fr)_minmax(90px,0.6fr)_minmax(140px,0.8fr)_auto] md:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                        <Folder className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedFolderId(folder.id)}
                          className="text-left text-sm font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-300"
                        >
                          {folder.name}
                        </button>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {count} file{count === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>
                    <div
                      className="truncate text-xs font-mono text-zinc-500 dark:text-zinc-400"
                      title={location}
                    >
                      {location}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Folder
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(folder.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 md:justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                      >
                        Open
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <EditFolderModal folder={folder} iconOnly />
                      <DeleteFolderButton folderId={folder.id} iconOnly />
                    </div>
                  </div>
                );
              })}

              {visibleDocuments.map((doc) => {
                const location = doc.folder_id
                  ? `/${organizationId}/${doc.folder_id}`
                  : `/${organizationId}`;
                return (
                  <div
                    key={doc.id}
                    className="grid grid-cols-1 gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 md:grid-cols-[minmax(220px,1.4fr)_minmax(140px,1fr)_minmax(90px,0.6fr)_minmax(140px,0.8fr)_auto] md:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {doc.filename}
                        </div>
                      </div>
                    </div>
                    <div
                      className="truncate text-xs font-mono text-zinc-500 dark:text-zinc-400"
                      title={location}
                    >
                      {location}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {documentTypeLabel(doc)}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(doc.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 md:justify-end">
                      <DeleteDocumentButton documentId={doc.id} iconOnly />
                    </div>
                  </div>
                );
              })}

              {visibleFolders.length === 0 && visibleDocuments.length === 0 && (
                <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  {normalizedQuery
                    ? "No matches found. Try a different search."
                    : selectedFolder
                      ? "This folder is empty."
                      : "No files or folders yet."}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
