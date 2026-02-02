"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { assignDocumentsToApplication } from "@/lib/actions";
import { Document, Folder as FolderType } from "@/lib/types";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Minus,
  Plus,
} from "lucide-react";

interface AssignDocumentsModalProps {
  applicationId: string;
  documents: Document[];
  folders: FolderType[];
  assignedDocumentIds: string[];
  iconOnly?: boolean;
}

function DocumentRow({
  doc,
  checked,
  onToggle,
}: {
  doc: Document;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
        checked
          ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20"
          : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700/50"
      }`}
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
          checked
            ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
            : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </div>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          <FileText className="h-4 w-4" />
        </div>
        <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {doc.filename}
        </div>
      </div>
    </div>
  );
}

function FolderRow({
  folder,
  documentCount,
  selectedCount,
  isChecked,
  isIndeterminate,
  onToggle,
  onOpen,
  showOpen = true,
  className = "",
}: {
  folder: FolderType;
  documentCount: number;
  selectedCount: number;
  isChecked: boolean;
  isIndeterminate: boolean;
  onToggle: () => void;
  onOpen?: () => void;
  showOpen?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${className} ${
        isChecked && documentCount > 0
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/10"
          : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700/50"
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border ${
            isChecked
              ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
              : isIndeterminate
                ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
                : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
          }`}
        >
          {isChecked && <Check className="h-3.5 w-3.5" />}
          {isIndeterminate && <Minus className="h-3.5 w-3.5" />}
        </div>

        <div
          onClick={onOpen}
          className={`flex items-center gap-3 overflow-hidden ${
            onOpen ? "cursor-pointer" : ""
          }`}
        >
          {onOpen ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Folder className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
              <FolderOpen className="h-4 w-4" />
            </div>
          )}
          <div className="truncate">
            <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {folder.name}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {selectedCount} / {documentCount} selected
            </div>
          </div>
        </div>
      </div>

      {showOpen && onOpen && (
        <button
          onClick={onOpen}
          type="button"
          className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default function AssignDocumentsModal({
  applicationId,
  documents,
  folders,
  assignedDocumentIds,
  iconOnly = false,
}: AssignDocumentsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(
    new Set(),
  );
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Filter out documents that are already assigned
  const availableDocuments = useMemo(() => {
    return documents.filter((doc) => !assignedDocumentIds.includes(doc.id));
  }, [documents, assignedDocumentIds]);

  // Group available documents by folder
  const folderEntries = useMemo(() => {
    return folders
      .map((folder) => {
        const folderDocs = availableDocuments.filter(
          (doc) => doc.folder_id === folder.id,
        );
        return { folder, documents: folderDocs };
      })
      .filter((entry) => entry.documents.length > 0);
  }, [folders, availableDocuments]);

  // Documents in the root (no folder)
  const rootDocuments = useMemo(() => {
    return availableDocuments.filter((doc) => !doc.folder_id);
  }, [availableDocuments]);

  // Current folder data
  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === currentFolderId) || null;
  }, [folders, currentFolderId]);

  const currentFolderDocuments = useMemo(() => {
    if (!currentFolderId) return [];
    return availableDocuments.filter(
      (doc) => doc.folder_id === currentFolderId,
    );
  }, [availableDocuments, currentFolderId]);

  const selectedCount = selectedDocumentIds.size;

  const toggleDocument = (docId: string) => {
    const newSelected = new Set(selectedDocumentIds);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocumentIds(newSelected);
  };

  const toggleFolder = (folderId: string) => {
    const folderDocs = availableDocuments.filter(
      (doc) => doc.folder_id === folderId,
    );
    const allSelected =
      folderDocs.length > 0 &&
      folderDocs.every((doc) => selectedDocumentIds.has(doc.id));

    const newSelected = new Set(selectedDocumentIds);
    folderDocs.forEach((doc) => {
      if (allSelected) {
        newSelected.delete(doc.id);
      } else {
        newSelected.add(doc.id);
      }
    });
    setSelectedDocumentIds(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocumentIds.size === 0) return;

    setLoading(true);
    setError("");

    try {
      const result = await assignDocumentsToApplication(
        applicationId,
        Array.from(selectedDocumentIds),
      );

      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        setSelectedDocumentIds(new Set());
        setCurrentFolderId(null);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    if (iconOnly) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          title="Assign documents"
          aria-label="Assign documents"
        >
          <Plus className="h-5 w-5" />
        </button>
      );
    }

    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        Assign Documents
      </button>
    );
  }

  return (
    <>
      <button
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors opacity-0 pointer-events-none"
        aria-hidden="true"
      >
        Assign Documents
      </button>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Assign Documents
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

            {documents.length === 0 ? (
              <div className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                No documents available for this organization.
              </div>
            ) : availableDocuments.length === 0 ? (
              <div className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                All documents are already assigned.
              </div>
            ) : (
              <div className="max-h-[360px] overflow-hidden rounded-md border border-zinc-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  <span>Directory</span>
                  <span>{selectedCount} selected</span>
                </div>

                {currentFolderId ? (
                  <div className="max-h-[320px] overflow-y-auto p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentFolderId(null)}
                        className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back to root
                      </button>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <FolderOpen className="h-4 w-4" />
                        {currentFolder?.name || "Folder"}
                      </div>
                    </div>

                    {currentFolder && (
                      <FolderRow
                        folder={currentFolder}
                        documentCount={currentFolderDocuments.length}
                        selectedCount={
                          currentFolderDocuments.filter((doc) =>
                            selectedDocumentIds.has(doc.id),
                          ).length
                        }
                        isChecked={
                          currentFolderDocuments.length > 0 &&
                          currentFolderDocuments.every((doc) =>
                            selectedDocumentIds.has(doc.id),
                          )
                        }
                        isIndeterminate={
                          currentFolderDocuments.some((doc) =>
                            selectedDocumentIds.has(doc.id),
                          ) &&
                          !currentFolderDocuments.every((doc) =>
                            selectedDocumentIds.has(doc.id),
                          )
                        }
                        onToggle={() => toggleFolder(currentFolder.id)}
                        showOpen={false}
                        className="mb-3 bg-zinc-50 dark:bg-zinc-800/50"
                      />
                    )}

                    <div className="space-y-1">
                      {currentFolderDocuments.length === 0 ? (
                        <div className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                          No documents in this folder.
                        </div>
                      ) : (
                        currentFolderDocuments.map((doc) => (
                          <DocumentRow
                            key={doc.id}
                            doc={doc}
                            checked={selectedDocumentIds.has(doc.id)}
                            onToggle={() => toggleDocument(doc.id)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[320px] overflow-y-auto p-3 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400">
                        <span>Folders</span>
                        <span>{folderEntries.length}</span>
                      </div>
                      {folderEntries.length === 0 ? (
                        <div className="mt-2 rounded-md bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                          No folders found.
                        </div>
                      ) : (
                        <div className="mt-2 space-y-1">
                          {folderEntries.map(
                            ({ folder, documents: folderDocs }) => {
                              const selectedInFolder = folderDocs.filter(
                                (doc) => selectedDocumentIds.has(doc.id),
                              ).length;
                              const allSelected =
                                folderDocs.length > 0 &&
                                folderDocs.every((doc) =>
                                  selectedDocumentIds.has(doc.id),
                                );
                              const someSelected =
                                folderDocs.some((doc) =>
                                  selectedDocumentIds.has(doc.id),
                                ) && !allSelected;

                              return (
                                <FolderRow
                                  key={folder.id}
                                  folder={folder}
                                  documentCount={folderDocs.length}
                                  selectedCount={selectedInFolder}
                                  isChecked={allSelected}
                                  isIndeterminate={someSelected}
                                  onToggle={() => toggleFolder(folder.id)}
                                  onOpen={() => setCurrentFolderId(folder.id)}
                                />
                              );
                            },
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400">
                        <span>Files</span>
                        <span>{rootDocuments.length}</span>
                      </div>
                      {rootDocuments.length === 0 ? (
                        <div className="mt-2 rounded-md bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                          No files at root.
                        </div>
                      ) : (
                        <div className="mt-2 space-y-1">
                          {rootDocuments.map((doc) => (
                            <DocumentRow
                              key={doc.id}
                              doc={doc}
                              checked={selectedDocumentIds.has(doc.id)}
                              onToggle={() => toggleDocument(doc.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                  documents.length === 0 ||
                  availableDocuments.length === 0 ||
                  selectedDocumentIds.size === 0
                }
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
              >
                {loading ? "Assigning..." : "Assign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
