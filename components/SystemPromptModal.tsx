"use client";

import { useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";
import { updateApplication } from "@/lib/actions";
import { Application } from "@/lib/types";

interface SystemPromptModalProps {
  application: Application;
}

export default function SystemPromptModal({
  application: initialApplication,
}: SystemPromptModalProps) {
  const [application, setApplication] = useState(initialApplication);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(application.system_prompt || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayPrompt = application.system_prompt || "";
  const isLong = displayPrompt.length > 100;

  function handleOpen() {
    setPrompt(application.system_prompt || "");
    setIsEditing(false);
    setError("");
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setError("");
    setIsEditing(false);
  }

  async function handleSave() {
    setLoading(true);
    setError("");

    // Optimistic update logic could go here, but let's wait for server response
    const result = await updateApplication(application.id, {
      system_prompt: prompt,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Update local state with new application data if returned,
      // otherwise just update the prompt locally
      setApplication({ ...application, system_prompt: prompt });
      setLoading(false);
      setIsEditing(false);
    }
  }

  return (
    <div className="w-full">
      {/* Trigger: Truncated text + Show More */}
      <div className="whitespace-pre-line text-zinc-900 dark:text-zinc-100 line-clamp-3">
        {displayPrompt || (
          <span className="text-zinc-400 italic">No prompt set</span>
        )}
      </div>
      {isLong && (
        <button
          onClick={handleOpen}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 -ml-1"
        >
          Show More <ChevronDown className="h-3 w-3" />
        </button>
      )}
      {!isLong && displayPrompt && (
        <button
          onClick={handleOpen}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500/20 rounded px-1 -ml-1"
        >
          <Pencil className="h-3 w-3" /> Edit Prompt
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 animate-in zoom-in-95 duration-200 flex flex-col h-[80vh]">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                System Prompt
              </h2>
              <button
                onClick={handleClose}
                className="rounded-full p-1 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400 flex-shrink-0">
                {error}
              </div>
            )}

            <div className="flex-1 min-h-0 relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                readOnly={!isEditing}
                disabled={loading}
                className={`w-full h-full resize-none rounded-md border p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 transition-all
                    ${
                      isEditing
                        ? "border-zinc-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        : "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 focus:ring-transparent cursor-default"
                    }`}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setPrompt(application.system_prompt || "");
                      setError("");
                    }}
                    disabled={loading}
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Prompt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
