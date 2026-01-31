"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100 selection:bg-indigo-500/30">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-indigo-500/10">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl"></div>

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-8 w-8 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S4.485 3 2 3m8 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in to manage your AI infrastructure
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue="admin_user"
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-zinc-100 placeholder-zinc-600 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:bg-zinc-950"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                defaultValue="secret_password"
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-zinc-100 placeholder-zinc-600 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:bg-zinc-950"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 disabled:opacity-70 disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? "Signing in..." : "Sign In"}
                {!isPending && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                )}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-500">
            Protected by secure encryption. Authorized personnel only.
          </div>
        </div>
      </div>
    </div>
  );
}
