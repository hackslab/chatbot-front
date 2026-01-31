"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Organization } from "@/lib/types";
import CreateOrganizationModal from "@/components/CreateOrganizationModal";

type OrganizationsViewSwitcherProps = {
  organizations: Organization[];
};

export default function OrganizationsViewSwitcher({
  organizations,
}: OrganizationsViewSwitcherProps) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "cards">("list");

  useLayoutEffect(() => {
    const storedView = window.localStorage.getItem("orgs-view");
    if (storedView === "list" || storedView === "cards") {
      setView(storedView);
    }
  }, []);

  const emptyState = useMemo(
    () => (
      <div className="col-span-full rounded-lg border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        No organizations found.
      </div>
    ),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Organizations
        </h1>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => {
                setView("list");
                window.localStorage.setItem("orgs-view", "list");
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => {
                setView("cards");
                window.localStorage.setItem("orgs-view", "cards");
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "cards"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Cards
            </button>
          </div>
          <CreateOrganizationModal />
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {organizations.length === 0
            ? emptyState
            : organizations.map((org) => (
                <div
                  key={org.id}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-gradient-to-br from-white via-white to-zinc-50 p-6 shadow-sm dark:border-zinc-800/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950"
                >
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20" />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-110">
                          <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                      </div>
                      
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-300 ${
                          org.is_active
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400"
                        }`}
                      >
                        <span
                          className={`relative flex h-2 w-2 ${
                            org.is_active ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        >
                          <span
                            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                              org.is_active ? "bg-emerald-400" : "bg-rose-400"
                            } opacity-75`}
                          />
                        </span>
                        {org.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {org.name}
                        </h2>
                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-zinc-100/50 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          {org.slug}
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 rounded-lg bg-zinc-50/50 p-3 dark:bg-zinc-800/50">
                        <svg
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                          {org.contact_info || "No contact info"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                        ID: {org.id.slice(0, 8)}...
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/organizations/${org.id}/applications`);
                        }}
                        className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:shadow-indigo-500/10 dark:focus:ring-offset-zinc-900"
                      >
                        Manage
                        <svg
                          className="h-4 w-4 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {organizations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-500"
                    >
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                  organizations.map((org) => (
                    <tr
                      key={org.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {org.name}
                      </td>
                      <td className="px-6 py-4">{org.slug}</td>
                      <td className="px-6 py-4">{org.contact_info || "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            org.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {org.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/admin/organizations/${org.id}/applications`)
                          }
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
