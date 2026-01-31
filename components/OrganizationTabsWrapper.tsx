"use client";

import { LayoutTemplate, FolderOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type OrganizationTabsWrapperProps = {
  organizationId: string;
  applicationsContent: ReactNode;
  filesContent: ReactNode;
};

export default function OrganizationTabsWrapper({
  organizationId,
  applicationsContent,
  filesContent,
}: OrganizationTabsWrapperProps) {
  const pathname = usePathname();
  const activeTab = pathname?.includes("/files") ? "files" : "applications";
  const basePath = `/admin/organizations/${organizationId}`;

  return (
    <div className="flex gap-6">
      <aside className="w-56 flex-shrink-0">
        <nav className="space-y-1">
          <Link
            href={`${basePath}/applications`}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "applications"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-l-4 border-indigo-500"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50 hover:border-l-4 hover:border-zinc-300"
            }`}
            aria-current={activeTab === "applications" ? "page" : undefined}
          >
            <LayoutTemplate className="h-5 w-5" />
            Applications
          </Link>
          <Link
            href={`${basePath}/files`}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "files"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-l-4 border-indigo-500"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50 hover:border-l-4 hover:border-zinc-300"
            }`}
            aria-current={activeTab === "files" ? "page" : undefined}
          >
            <FolderOpen className="h-5 w-5" />
            Files
          </Link>
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        {activeTab === "applications" && applicationsContent}
        {activeTab === "files" && filesContent}
      </main>
    </div>
  );
}
