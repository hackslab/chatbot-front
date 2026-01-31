"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface BotTokenCardProps {
  botToken?: string | null;
}

export default function BotTokenCard({ botToken }: BotTokenCardProps) {
  const [currentToken] = useState(botToken || "");

  const maskedToken = currentToken
    ? `${currentToken.slice(0, 6)}**********${currentToken.slice(-4)}`
    : "Not available";

  async function handleCopy() {
    if (!currentToken) return;
    try {
      await navigator.clipboard.writeText(currentToken);
      toast.success("Bot token copied to clipboard");
    } catch {
      toast.error("Copy failed. Please copy manually.");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Telegram Bot Token
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Keep this token secret. Update it in the application settings.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {maskedToken}
        </div>
        <button
          onClick={handleCopy}
          disabled={!currentToken}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
          title="Copy token"
        >
          <Copy className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
