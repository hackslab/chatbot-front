"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Plus, RefreshCcw, Trash2, Pencil } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  APPLICATION_TYPE_OPTIONS,
  formatApplicationType,
} from "@/lib/application";
import {
  ApplicationType,
  CreateProviderDto,
  Provider,
  UpdateProviderDto,
} from "@/lib/types";
import {
  createProvider,
  deleteProvider,
  regenerateProviderKey,
  updateProvider,
} from "@/lib/actions";

interface ProvidersCardProps {
  applicationId: string;
  providers: Provider[];
}

const SUPPORTED_PROVIDER_TYPES: ApplicationType[] = ["API", "TELEGRAM_BOT"];

function maskSecret(value?: string | null) {
  if (!value) return "Not available";
  if (value.length <= 10) return `${value.slice(0, 4)}****`;
  return `${value.slice(0, 6)}**********${value.slice(-4)}`;
}

export default function ProvidersCard({
  applicationId,
  providers: initialProviders,
}: ProvidersCardProps) {
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const existingTypes = useMemo(
    () => new Set(providers.map((provider) => provider.type)),
    [providers],
  );

  const availableTypes = useMemo(
    () =>
      APPLICATION_TYPE_OPTIONS.filter(
        (option) =>
          SUPPORTED_PROVIDER_TYPES.includes(option.value) &&
          !existingTypes.has(option.value),
      ),
    [existingTypes],
  );

  const [formState, setFormState] = useState({
    type: availableTypes[0]?.value ?? "API",
    name: "",
    bot_token: "",
  });

  const canAddProviders = availableTypes.length > 0;

  function resetFormState() {
    setFormState({
      type: availableTypes[0]?.value ?? "API",
      name: "",
      bot_token: "",
    });
  }

  async function handleCopy(value?: string | null) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed. Please copy manually.");
    }
  }

  async function handleCreateProvider(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const payload: CreateProviderDto = {
      type: formState.type,
      name: formState.name || undefined,
      bot_token:
        formState.type === "TELEGRAM_BOT" ? formState.bot_token : undefined,
    };

    if (payload.type === "TELEGRAM_BOT" && !payload.bot_token) {
      toast.error("Telegram bot token is required.");
      setIsSaving(false);
      return;
    }

    const result = await createProvider(applicationId, payload);

    if (result?.error) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    if (result?.provider) {
      setProviders((prev) => [...prev, result.provider]);
      toast.success("Provider added successfully");
    }

    setIsSaving(false);
    setIsAddOpen(false);
    resetFormState();
  }

  function openEdit(provider: Provider) {
    setActiveProvider(provider);
    setFormState({
      type: provider.type,
      name: provider.name ?? "",
      bot_token: "",
    });
    setIsEditOpen(true);
  }

  async function handleUpdateProvider(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeProvider) return;

    setIsSaving(true);
    const payload: UpdateProviderDto = {
      name: formState.name || undefined,
    };

    if (activeProvider.type === "TELEGRAM_BOT" && formState.bot_token) {
      payload.bot_token = formState.bot_token;
    }

    const result = await updateProvider(activeProvider.id, payload);

    if (result?.error) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    if (result?.provider) {
      setProviders((prev) =>
        prev.map((provider) =>
          provider.id === result.provider.id ? result.provider : provider,
        ),
      );
      toast.success("Provider updated successfully");
    }

    setIsSaving(false);
    setIsEditOpen(false);
    setActiveProvider(null);
    resetFormState();
  }

  function requestDelete(provider: Provider) {
    setActiveProvider(provider);
    setShowDeleteConfirm(true);
  }

  async function handleDeleteProvider() {
    if (!activeProvider) return;
    setShowDeleteConfirm(false);
    setIsSaving(true);

    const result = await deleteProvider(activeProvider.id);

    if (result?.error) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    setProviders((prev) =>
      prev.filter((provider) => provider.id !== activeProvider.id),
    );
    toast.success("Provider removed successfully");
    setIsSaving(false);
    setActiveProvider(null);
  }

  function requestRegenerate(provider: Provider) {
    setActiveProvider(provider);
    setShowRegenerateConfirm(true);
  }

  async function handleRegenerateKey() {
    if (!activeProvider) return;
    setShowRegenerateConfirm(false);
    setIsSaving(true);

    const result = await regenerateProviderKey(activeProvider.id);

    if (result?.error) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    if (result?.provider) {
      setProviders((prev) =>
        prev.map((provider) =>
          provider.id === result.provider.id ? result.provider : provider,
        ),
      );
      toast.success("API key regenerated successfully");
    }

    setIsSaving(false);
    setActiveProvider(null);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Integrations
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Connect API keys and bot credentials to this application.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetFormState();
            setIsAddOpen(true);
          }}
          disabled={!canAddProviders}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" />
          Add Provider
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {providers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
            No providers configured yet.
          </div>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {provider.name || formatApplicationType(provider.type)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatApplicationType(provider.type)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {provider.type === "TELEGRAM_BOT" && (
                    <button
                      type="button"
                      onClick={() => openEdit(provider)}
                      className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <span className="sr-only">Edit provider</span>
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => requestDelete(provider)}
                    className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <span className="sr-only">Delete provider</span>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {provider.type === "API" ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                    {maskSecret(provider.api_key)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(provider.api_key)}
                    className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    title="Copy key"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestRegenerate(provider)}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Regenerate
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                    {maskSecret(provider.bot_token)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!canAddProviders && (
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          All supported providers are already connected.
        </p>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Add Provider
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
              >
                <span className="sr-only">Close</span>
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
            <form onSubmit={handleCreateProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Type
                </label>
                <select
                  value={formState.type}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      type: event.target.value as ApplicationType,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {availableTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              {formState.type === "TELEGRAM_BOT" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Telegram Bot Token
                  </label>
                  <input
                    type="text"
                    value={formState.bot_token}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        bot_token: event.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Use the token from BotFather to connect your bot.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Add Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && activeProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Update Provider
              </h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
              >
                <span className="sr-only">Close</span>
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
            <form onSubmit={handleUpdateProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              {activeProvider.type === "TELEGRAM_BOT" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Telegram Bot Token
                  </label>
                  <input
                    type="text"
                    value={formState.bot_token}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        bot_token: event.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Provider"
        message="Remove this provider? Existing clients using it will stop working."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteProvider}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="danger"
      />

      <ConfirmDialog
        open={showRegenerateConfirm}
        title="Regenerate API Key"
        message="Regenerate the API key? Existing clients will stop working."
        confirmText="Regenerate"
        cancelText="Cancel"
        onConfirm={handleRegenerateKey}
        onCancel={() => setShowRegenerateConfirm(false)}
        variant="warning"
      />
    </div>
  );
}
