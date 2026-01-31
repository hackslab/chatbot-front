"use client";

import { useState } from "react";
import Link from "next/link";
import { AiModel, Application, Organization } from "@/lib/types";
import CreateApplicationModal from "@/components/CreateApplicationModal";
import { Bot, Zap, Calendar, ArrowRight } from "lucide-react";

type OrganizationApplicationsSectionProps = {
  organizationId: string;
  applications: Application[];
  organizations: Organization[];
  aiModels: AiModel[];
  initialOrganizationId?: string;
};

export default function OrganizationApplicationsSection({
  organizationId,
  applications,
  organizations,
  aiModels,
  initialOrganizationId,
}: OrganizationApplicationsSectionProps) {
  const [showCards, setShowCards] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Applications
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <CreateApplicationModal
            organizations={organizations}
            aiModels={aiModels}
            initialOrganizationId={initialOrganizationId}
            buttonLabel="Add Application"
          />
          <button
            onClick={() => setShowCards(!showCards)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              showCards
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {showCards ? "Table View" : "Card View"}
          </button>
        </div>
      </div>

      {showCards ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-500">
              No applications found.
            </div>
          ) : (
            applications.map((application) => (
              <div
                key={application.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {application.name}
                        </h3>
                        {application.created_at && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Zap className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Temperature</p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {application.temperature}
                          <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                            {application.temperature > 0.7 ? "(Creative)" : application.temperature > 0.4 ? "(Balanced)" : "(Precise)"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Bot className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">AI Model</p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {aiModels.find(m => m.id === application.ai_model_id)?.name || application.ai_model_id}
                        </p>
                      </div>
                    </div>

                    {application.system_prompt && (
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">System Prompt</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                          {application.system_prompt}
                        </p>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/admin/organizations/${organizationId}/applications/${application.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/25"
                  >
                    Manage Application
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100/50 dark:border-zinc-800 dark:from-zinc-800/50 dark:to-zinc-900/50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Application
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  AI Model
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Temperature
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {applications.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr
                    key={application.id}
                    className="bg-white dark:bg-zinc-900"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {application.name}
                          </p>
                          {application.system_prompt && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                              {application.system_prompt.substring(0, 50)}
                              {application.system_prompt.length > 50 ? '...' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <Zap className="h-3.5 w-3.5 text-indigo-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {aiModels.find(m => m.id === application.ai_model_id)?.name || application.ai_model_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
                        {application.temperature > 0.7 ? (
                          <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            Creative ({application.temperature})
                          </span>
                        ) : application.temperature > 0.4 ? (
                          <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                            Balanced ({application.temperature})
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Precise ({application.temperature})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {application.created_at ? new Date(application.created_at).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/organizations/${organizationId}/applications/${application.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-md shadow-indigo-500/25"
                      >
                        Manage
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
