"use client";

import { useState } from "react";
import Link from "next/link";
import { createApplication } from "@/lib/actions";
import {
  AiModel,
  ApplicationType,
  CreateApplicationDto,
  Organization,
} from "@/lib/types";
import { APPLICATION_TYPE_OPTIONS } from "@/lib/application";

interface CreateApplicationModalProps {
  organizations: Organization[];
  aiModels: AiModel[];
  initialOrganizationId?: string;
  buttonLabel?: string;
}

export default function CreateApplicationModal({
  organizations,
  aiModels,
  initialOrganizationId,
  buttonLabel = "Create Application",
}: CreateApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<ApplicationType>("API");

  const initialOrgId =
    (initialOrganizationId &&
      organizations.some((org) => org.id === initialOrganizationId) &&
      initialOrganizationId) ||
    organizations[0]?.id ||
    "";

  const initialModelId = aiModels[0]?.id || "";

  function handleOpen() {
    setSelectedType("API");
    setError("");
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setError("");
    setSelectedType("API");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const system_prompt = formData.get("system_prompt") as string;
    const ai_model_id = formData.get("ai_model_id") as string;
    const organization_id = formData.get("organization_id") as string;
    const temperatureValue = formData.get("temperature") as string;
    const temperature = temperatureValue
      ? Number.parseFloat(temperatureValue)
      : undefined;
    const type = (formData.get("type") as ApplicationType) || "API";
    const bot_token = (formData.get("bot_token") as string) || "";

    if (!ai_model_id) {
      setError("Select an AI model.");
      setLoading(false);
      return;
    }

    if (type === "TELEGRAM_BOT" && !bot_token) {
      setError("Telegram bot token is required.");
      setLoading(false);
      return;
    }

    const payload: CreateApplicationDto = {
      name,
      system_prompt,
      ai_model_id,
      organization_id,
      type,
    };

    if (type === "TELEGRAM_BOT") {
      payload.bot_token = bot_token;
    }

    if (temperature !== undefined && !Number.isNaN(temperature)) {
      payload.temperature = temperature;
    }

    const result = await createApplication(payload);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      handleClose();
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer"
      >
        {buttonLabel}
      </button>
    );
  }

  return (
    <>
      <button
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors opacity-0 pointer-events-none"
        aria-hidden="true"
      >
        {buttonLabel}
      </button>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              New Application
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

            {organizations.length === 0 && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                Create an organization before adding applications.
              </div>
            )}

            {aiModels.length === 0 && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                <div>Create an AI model before adding applications.</div>
                <div className="mt-3">
                  <Link
                    href="/admin/ai-models"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    Create AI Model
                  </Link>
                </div>
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
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="Support Bot"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Channel
              </label>
              <select
                id="type"
                name="type"
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(event.target.value as ApplicationType)
                }
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {APPLICATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                API and Telegram are supported today. Other channels are for
                future use.
              </p>
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
                required
                rows={4}
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="You are a helpful assistant for Acme Corp."
              />
            </div>

            {selectedType === "TELEGRAM_BOT" && (
              <div>
                <label
                  htmlFor="bot_token"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  name="bot_token"
                  id="bot_token"
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="123456:ABCDEF"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Use the token from BotFather to connect your Telegram bot.
                </p>
              </div>
            )}

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
                defaultValue={initialModelId}
                required
                disabled={aiModels.length === 0}
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {aiModels.length === 0 && (
                  <option value="">No AI models</option>
                )}
                {aiModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.key})
                  </option>
                ))}
              </select>
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
                defaultValue={initialOrgId}
                required
                disabled={organizations.length === 0}
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {organizations.length === 0 && (
                  <option value="">No organizations</option>
                )}
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="temperature"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Temperature
              </label>
              <input
                type="number"
                name="temperature"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.7"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
                disabled={loading || organizations.length === 0 || aiModels.length === 0}
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
                    Creating...
                  </>
                ) : (
                  buttonLabel
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
