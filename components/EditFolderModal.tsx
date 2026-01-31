"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateFolder } from "@/lib/actions";
import { Folder } from "@/lib/types";

interface EditFolderModalProps {
  folder: Folder;
  iconOnly?: boolean;
  className?: string;
}

export default function EditFolderModal({
  folder,
  iconOnly = false,
  className = "",
}: EditFolderModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const triggerClassName = iconOnly
    ? `inline-flex h-8 w-8 items-center justify-center rounded-md text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-200 transition-colors ${className}`
    : `text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 ${className}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    const result = await updateFolder(folder.id, { name });

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
        className={triggerClassName}
        aria-label={iconOnly ? "Edit folder" : undefined}
        title={iconOnly ? "Edit folder" : undefined}
      >
        {iconOnly ? <Pencil className="h-4 w-4" /> : "Edit"}
      </button>
    );
  }

  return (
    <>
      <button
        className={`${triggerClassName} opacity-0 pointer-events-none`}
        aria-hidden="true"
      >
        {iconOnly ? <Pencil className="h-4 w-4" /> : "Edit"}
      </button>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Edit Folder
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

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Folder Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={folder.name}
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Organization ID
              </label>
              <div className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                {folder.organization_id}
              </div>
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
                disabled={loading}
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
