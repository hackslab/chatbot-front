"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Send } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ChatMessage = {
  role: "USER" | "ASSISTANT";
  content: string;
};

interface TestChatbotCardProps {
  applicationId: string;
  apiKey?: string | null;
}

export default function TestChatbotCard({
  applicationId,
  apiKey,
}: TestChatbotCardProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [sessionTimestamp, setSessionTimestamp] = useState(() => Date.now());

  const sessionId = useMemo(
    () => `admin-test-${applicationId}-${sessionTimestamp}`,
    [applicationId, sessionTimestamp],
  );
  const canChat = Boolean(apiKey);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isSending]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canChat || isSending) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    setError(null);
    const nextMessages = [
      ...messages,
      { role: "USER" as const, content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          source: "WEB",
          messages: nextMessages,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Chat request failed.";
        try {
          const data = await response.json();
          if (typeof data?.message === "string") {
            errorMessage = data.message;
          }
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const content =
        typeof data?.content === "string" && data.content.trim().length > 0
          ? data.content
          : "No response content.";

      setMessages([...nextMessages, { role: "ASSISTANT", content }]);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Chat request failed.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  function handleReset() {
    setMessages([]);
    setError(null);
    setSessionTimestamp(Date.now());
  }

  function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(event.target.value);
    if (error) setError(null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Test Chatbot
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Send a message using this application's API key.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={messages.length === 0 || isSending}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <RotateCcw className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div
        ref={listRef}
        className="mt-4 flex h-[400px] flex-col gap-3 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
      >
        {messages.length === 0 ? (
          <p className="text-xs text-zinc-400">No messages yet.</p>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === "USER";
            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm shadow-sm ${
                    isUser
                      ? "bg-indigo-600 text-white"
                      : "border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {!canChat && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          API key required. Test chat is available for API applications only.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Ask a question about your knowledge base..."
          disabled={!canChat || isSending}
          className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Replies are generated using the latest user message.
          </p>
          <button
            type="submit"
            disabled={!canChat || isSending || input.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
