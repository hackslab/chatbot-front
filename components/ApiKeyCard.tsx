"use client";

import { useState } from "react";
import { toast } from "sonner";
import { regenerateApiKey } from "@/lib/actions";
import { Copy } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface ApiKeyCardProps {
  applicationId: string;
  apiKey?: string;
}

export default function ApiKeyCard({ applicationId, apiKey }: ApiKeyCardProps) {
  const [currentKey, setCurrentKey] = useState(apiKey || "");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const maskedKey = currentKey
    ? `${currentKey.slice(0, 6)}**********${currentKey.slice(-4)}`
    : "Not available";

  async function handleCopy() {
    if (!currentKey) return;
    try {
      await navigator.clipboard.writeText(currentKey);
      toast.success("API key copied to clipboard");
    } catch {
      toast.error("Copy failed. Please copy manually.");
    }
  }

  function handleRegenerateClick() {
    setShowConfirm(true);
  }

  async function handleRegenerate() {
    setShowConfirm(false);

    setLoading(true);
    const result = await regenerateApiKey(applicationId);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    if (result?.apiKey) {
      setCurrentKey(result.apiKey);
      toast.success("API key regenerated successfully");
    }

    setLoading(false);
  }

  function handleCancelRegenerate() {
    setShowConfirm(false);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            API Key
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Keep this key secret. Regenerating will revoke the old one.
          </p>
        </div>
        <button
          onClick={handleRegenerateClick}
          disabled={loading}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-60"
        >
          {loading ? "Regenerating..." : "Regenerate"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {maskedKey}
        </div>
        <button
          onClick={handleCopy}
          disabled={!currentKey}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
          title="Copy key"
        >
          <Copy className="h-5 w-5" />
        </button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Regenerate API Key"
        message="Regenerate the API key? Existing clients will stop working."
        confirmText="Regenerate"
        cancelText="Cancel"
        onConfirm={handleRegenerate}
        onCancel={handleCancelRegenerate}
        variant="warning"
      />
    </div>
  );
}
