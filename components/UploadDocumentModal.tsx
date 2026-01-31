"use client";

import { useMemo, useRef, useState } from "react";
import { uploadDocument } from "@/lib/actions";
import { Folder, Organization, OrganizationStorageUsage } from "@/lib/types";

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
const ACCEPT_ATTRIBUTE = ALLOWED_EXTENSIONS.join(",");
const MAX_ORG_STORAGE_LABEL = "20MB";

interface UploadDocumentModalProps {
  organizations: Organization[];
  folders: Folder[];
  initialOrganizationId?: string;
  initialFolderId?: string;
  storageUsage?: OrganizationStorageUsage | null;
}

export default function UploadDocumentModal({
  organizations,
  folders,
  initialOrganizationId,
  initialFolderId,
  storageUsage,
}: UploadDocumentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    completed: number;
    current?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialOrgId =
    (initialOrganizationId &&
      organizations.some((org) => org.id === initialOrganizationId) &&
      initialOrganizationId) ||
    organizations[0]?.id ||
    "";

  const initialFolderSelection =
    (initialFolderId &&
      folders.some(
        (folder) =>
          folder.id === initialFolderId &&
          folder.organization_id === initialOrgId,
      ) &&
      initialFolderId) ||
    "";

  const selectedOrgId = initialOrgId;
  const [selectedFolderId, setSelectedFolderId] = useState(
    initialFolderSelection,
  );
  const remainingBytes =
    storageUsage && storageUsage.limit_bytes > 0
      ? Math.max(0, storageUsage.limit_bytes - storageUsage.used_bytes)
      : null;

  const availableFolders = useMemo(() => {
    if (!selectedOrgId) return [];
    return folders.filter((folder) => folder.organization_id === selectedOrgId);
  }, [folders, selectedOrgId]);

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

  function fileExtension(file: File) {
    const name = file.name.toLowerCase();
    const lastDot = name.lastIndexOf(".");
    return lastDot >= 0 ? name.slice(lastDot) : "";
  }

  function mergeFiles(current: File[], incoming: File[]) {
    const next = [...current];
    const seen = new Set(
      current.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
    );
    incoming.forEach((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (!seen.has(key)) {
        seen.add(key);
        next.push(file);
      }
    });
    return next;
  }

  function handleFiles(incomingFiles: FileList | File[]) {
    const incoming = Array.from(incomingFiles || []);
    if (incoming.length === 0) return;

    const invalidFiles = incoming.filter(
      (file) => !ALLOWED_EXTENSIONS.includes(fileExtension(file)),
    );
    const validFiles = incoming.filter((file) =>
      ALLOWED_EXTENSIONS.includes(fileExtension(file)),
    );

    if (invalidFiles.length > 0) {
      setError(
        `Unsupported files: ${invalidFiles
          .map((file) => file.name)
          .join(", ")}. Allowed: ${ALLOWED_EXTENSIONS_LABEL}.`,
      );
    } else {
      setError("");
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => mergeFiles(prev, validFiles));
    }
  }

  function removeFile(fileToRemove: File) {
    setSelectedFiles((prev) =>
      prev.filter(
        (file) =>
          !(
            file.name === fileToRemove.name &&
            file.size === fileToRemove.size &&
            file.lastModified === fileToRemove.lastModified
          ),
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (selectedFiles.length === 0) {
      setError("Select at least one file to upload.");
      setLoading(false);
      return;
    }

    const invalidSelected = selectedFiles.filter(
      (file) => !ALLOWED_EXTENSIONS.includes(fileExtension(file)),
    );

    if (invalidSelected.length > 0) {
      setError(
        `Unsupported files: ${invalidSelected
          .map((file) => file.name)
          .join(", ")}. Allowed: ${ALLOWED_EXTENSIONS_LABEL}.`,
      );
      setLoading(false);
      return;
    }

    if (!selectedOrgId) {
      setError("No organization selected.");
      setLoading(false);
      return;
    }

    if (remainingBytes !== null) {
      const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalBytes > remainingBytes) {
        setError(
          `Not enough storage. ${formatBytes(remainingBytes)} remaining, ${formatBytes(totalBytes)} selected.`,
        );
        setLoading(false);
        return;
      }
    }

    const failures: string[] = [];
    setUploadProgress({
      total: selectedFiles.length,
      completed: 0,
      current: selectedFiles[0]?.name,
    });

    for (const file of selectedFiles) {
      setUploadProgress((prev) =>
        prev ? { ...prev, current: file.name } : prev,
      );
      const payload = new FormData();
      payload.append("file", file);
      payload.append("organizationId", selectedOrgId);
      if (selectedFolderId) {
        payload.append("folderId", selectedFolderId);
      }

      const result = await uploadDocument(payload);

      if (result?.error) {
        failures.push(`${file.name}: ${result.error}`);
      }
      setUploadProgress((prev) =>
        prev
          ? { ...prev, completed: Math.min(prev.completed + 1, prev.total) }
          : prev,
      );
    }

    if (failures.length > 0) {
      setError(`Failed to upload ${failures.length} file(s): ${failures.join(" | ")}`);
      setLoading(false);
      setUploadProgress(null);
      return;
    }

    setLoading(false);
    setIsOpen(false);
    setSelectedFiles([]);
    setUploadProgress(null);
  }

  const uploadPercent = uploadProgress
    ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
    : 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer"
      >
        Upload Document
      </button>
    );
  }

  return (
    <>
      <button
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors opacity-0 pointer-events-none"
        aria-hidden="true"
      >
        Upload Document
      </button>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Upload Document
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {organizations.length === 0 && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                Create an organization before uploading documents.
              </div>
            )}

            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Files
              </label>
              <div
                className={`mt-1 rounded-md border border-dashed px-4 py-4 text-sm transition-colors ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/10"
                    : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "copy";
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFiles(event.dataTransfer.files);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  id="file"
                  accept={ACCEPT_ATTRIBUTE}
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files) {
                      handleFiles(event.target.files);
                      event.target.value = "";
                    }
                  }}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    Choose files
                  </button>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    or drag & drop here
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Allowed: {ALLOWED_EXTENSIONS_LABEL}. Max storage per
                  organization: {MAX_ORG_STORAGE_LABEL}.
                </p>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>
                      Selected files ({selectedFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                    {selectedFiles.map((file) => (
                      <div
                        key={`${file.name}-${file.size}-${file.lastModified}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(file)}
                          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {uploadProgress && (
              <div className="rounded-md border border-indigo-200 bg-indigo-50/60 p-3 text-xs text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-900/20 dark:text-indigo-200">
                <div className="flex items-center justify-between">
                  <span>
                    Uploading {uploadProgress.completed} of {uploadProgress.total}
                  </span>
                  <span className="font-medium">{uploadPercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-indigo-200/70 dark:bg-indigo-900/40">
                  <div
                    className="h-2 rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
                {uploadProgress.current && (
                  <div className="mt-2 truncate text-xs text-indigo-600 dark:text-indigo-200">
                    {uploadProgress.current}
                  </div>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="folderId"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Folder (optional)
              </label>
              <select
                id="folderId"
                name="folderId"
                value={selectedFolderId}
                onChange={(event) => setSelectedFolderId(event.target.value)}
                disabled={!selectedOrgId || availableFolders.length === 0}
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">No folder</option>
                {availableFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  organizations.length === 0 ||
                  selectedFiles.length === 0 ||
                  !selectedOrgId
                }
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
              >
                {loading ? (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
