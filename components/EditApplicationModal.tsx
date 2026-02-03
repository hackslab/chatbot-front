"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateApplication } from "@/lib/actions";
import {
  AiModel,
  Application,
  Organization,
  UpdateApplicationDto,
} from "@/lib/types";

interface EditApplicationModalProps {
  application: Application;
  organizations: Organization[];
  aiModels?: AiModel[];
  iconOnly?: boolean;
  buttonLabel?: string;
  className?: string;
}

export default function EditApplicationModal({
  application,
  organizations,
  aiModels = [],
  iconOnly = false,
  buttonLabel = "Edit",
  className,
}: EditApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const hasCurrentModel = aiModels.some(
    (model) => model.id === application.ai_model_id,
  );
  const [temperature, setTemperature] = useState(application.temperature);

  function handleOpen() {
    setTemperature(application.temperature);
    setError("");
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const system_prompt = formData.get("system_prompt") as string;
    const ai_model_id =
      (formData.get("ai_model_id") as string) || application.ai_model_id;
    const organization_id = formData.get("organization_id") as string;
    const temperatureValue = formData.get("temperature") as string;
    const temperature = temperatureValue
      ? Number.parseFloat(temperatureValue)
      : undefined;

    const payload: UpdateApplicationDto = {
      name,
      system_prompt,
      ai_model_id,
      organization_id,
    };

    if (temperature !== undefined && !Number.isNaN(temperature)) {
      payload.temperature = temperature;
    }

    const result = await updateApplication(application.id, payload);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      handleClose();
    }
  }

  if (!isOpen) {
    if (iconOnly) {
      return (
        <button
          onClick={handleOpen}
          className={
            className ||
            "rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          }
          title="Edit application"
          aria-label="Edit application"
        >
          <Pencil className="h-4 w-4" />
        </button>
      );
    }
    return (
      <button
        onClick={handleOpen}
        className={
          className ||
          "text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
        }
      >
        {buttonLabel}
      </button>
    );
  }

  return (
    <>
      {iconOnly ? (
        <button
          className={
            (className ||
              "rounded-lg p-2 text-zinc-400 opacity-0 pointer-events-none") +
            " opacity-0 pointer-events-none"
          }
          aria-hidden="true"
          tabIndex={-1}
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : (
        <button
          className={
            (className ||
              "text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300") +
            " opacity-0 pointer-events-none"
          }
          aria-hidden="true"
        >
          {buttonLabel}
        </button>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Edit Application
            </h2>
            <button
              onClick={handleClose}
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
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={application.name}
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>


            <div>
              <label
                htmlFor="system_prompt"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                System Prompt
              </label>
              <textarea
                name="system_prompt"
                id="system_prompt"
                defaultValue={application.system_prompt}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>


            <div>
              <label
                htmlFor="ai_model_id"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                AI Model
              </label>
              <select
                id="ai_model_id"
                name="ai_model_id"
                defaultValue={application.ai_model_id}
                required
                disabled={aiModels.length === 0}
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {aiModels.length === 0 ? (
                  <option value={application.ai_model_id}>
                    Current model (unavailable)
                  </option>
                ) : (
                  <>
                    {!hasCurrentModel && (
                      <option value={application.ai_model_id}>
                        Current model (missing)
                      </option>
                    )}
                    {aiModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.key})
                      </option>
                    ))}
                  </>
                )}
              </select>
              {aiModels.length === 0 && (
                <div className="mt-2 rounded-md bg-amber-50 p-3 text-xs text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                  <div>No AI models available.</div>
                  <div className="mt-2">
                    <Link
                      href="/admin/ai-models"
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                    >
                      Create AI Model
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="organization_id"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Organization
              </label>
              <select
                id="organization_id"
                name="organization_id"
                defaultValue={application.organization_id}
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between">
                <label
                  htmlFor="temperature"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Temperature
                </label>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {temperature}
                </span>
              </div>
              <input
                type="range"
                name="temperature"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="mt-2 block w-full cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
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
