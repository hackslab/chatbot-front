"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { assignDocumentsToApplication } from "@/lib/actions";
import { Document, Folder as FolderType } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";

interface AssignDocumentsModalProps {
  applicationId: string;
  documents: Document[];
  folders: FolderType[];
  assignedDocumentIds: string[];
}

type FolderRowProps = {
  folder: FolderType;
  documentCount: number;
  selectedCount: number;
  isChecked: boolean;
  isIndeterminate: boolean;
  onToggle: () => void;
  onOpen?: () => void;
  showOpen?: boolean;
  className?: string;
};

function FolderRow({
  folder,
  documentCount,
  selectedCount,
  isChecked,
  isIndeterminate,
  onToggle,
  onOpen,
  showOpen = true,
  className,
}: FolderRowProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const metaText = documentCount === 0
    ? "Empty folder"
    : selectedCount > 0
      ? `${selectedCount} selected`
      : `${documentCount} file${documentCount === 1 ? "" : "s"}`;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
        className || ""
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          disabled={documentCount === 0}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
        />
        <button
          type="button"
          onDoubleClick={showOpen ? onOpen : undefined}
          className="flex items-center gap-2 text-left"
          title={showOpen ? "Double click to open" : undefined}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Folder className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {folder.name}
            </span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              {metaText}
            </span>
          </div>
        </button>
      </div>
      {showOpen && (
        <button
          type="button"
          onClick={onOpen}
          disabled={!onOpen}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label={`Open ${folder.name}`}
        >
          <span className="hidden sm:inline">Open</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

type DocumentRowProps = {
  doc: Document;
  checked: boolean;
  onToggle: () => void;
};

function DocumentRow({ doc, checked, onToggle }: DocumentRowProps) {
  return (
    <label className="flex items-start gap-3 rounded-md p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800"
      />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {doc.filename}
          </span>
        </div>
      </div>
    </label>
  );
}

export default function AssignDocumentsModal({
  applicationId,
  documents,
  folders,
  assignedDocumentIds,
}: AssignDocumentsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(
    new Set(),
  );
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedDocumentIds(new Set());
      setCurrentFolderId(null);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  const availableDocuments = useMemo(() => {
    return documents.filter((doc) => !assignedDocumentIds.includes(doc.id));
  }, [documents, assignedDocumentIds]);

  const documentsByFolderId = useMemo(() => {
    const map = new Map<string, Document[]>();
    availableDocuments.forEach((doc) => {
      if (!doc.folder_id) return;
      const bucket = map.get(doc.folder_id) || [];
      bucket.push(doc);
      map.set(doc.folder_id, bucket);
    });
    return map;
  }, [availableDocuments]);

  const rootDocuments = useMemo(() => {
    return availableDocuments.filter((doc) => !doc.folder_id);
  }, [availableDocuments]);

  const folderEntries = useMemo(() => {
    return folders.map((folder) => ({
      folder,
      documents: documentsByFolderId.get(folder.id) || [],
    }));
  }, [folders, documentsByFolderId]);

  const currentFolder = useMemo(() => {
    return folders.find((folder) => folder.id === currentFolderId) || null;
  }, [folders, currentFolderId]);

  const currentFolderDocuments = useMemo(() => {
    if (!currentFolderId) return [];
    return documentsByFolderId.get(currentFolderId) || [];
  }, [currentFolderId, documentsByFolderId]);

  const selectedCount = selectedDocumentIds.size;

  function toggleDocument(docId: string) {
    setSelectedDocumentIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  }

  function toggleFolder(folderId: string) {
    const folderDocs = documentsByFolderId.get(folderId) || [];
    if (folderDocs.length === 0) return;

    setSelectedDocumentIds((prev) => {
      const next = new Set(prev);
      const allSelected = folderDocs.every((doc) => next.has(doc.id));
      folderDocs.forEach((doc) => {
        if (allSelected) {
          next.delete(doc.id);
        } else {
          next.add(doc.id);
        }
      });
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const documentIds = Array.from(selectedDocumentIds);

    if (documentIds.length === 0) {
      setError("Select at least one document.");
      setLoading(false);
      return;
    }

    const result = await assignDocumentsToApplication(applicationId, documentIds);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  if (!isOpen) {
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
                        selectedCount={currentFolderDocuments.filter((doc) => selectedDocumentIds.has(doc.id)).length}
                        isChecked={
                          currentFolderDocuments.length > 0 &&
                          currentFolderDocuments.every((doc) => selectedDocumentIds.has(doc.id))
                        }
                        isIndeterminate={
                          currentFolderDocuments.some((doc) => selectedDocumentIds.has(doc.id)) &&
                          !currentFolderDocuments.every((doc) => selectedDocumentIds.has(doc.id))
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
                          {folderEntries.map(({ folder, documents: folderDocs }) => {
                            const selectedInFolder = folderDocs.filter((doc) =>
                              selectedDocumentIds.has(doc.id),
                            ).length;
                            const allSelected =
                              folderDocs.length > 0 &&
                              folderDocs.every((doc) => selectedDocumentIds.has(doc.id));
                            const someSelected =
                              folderDocs.some((doc) => selectedDocumentIds.has(doc.id)) &&
                              !allSelected;

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
                          })}
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
