import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AiModel } from "@/lib/types";
import CreateAiModelModal from "@/components/CreateAiModelModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getAiModels(): Promise<AiModel[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return [];

    const res = await fetch(`${API_URL}/admin/ai-models`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/");
    }

    if (!res.ok) {
      console.warn("Failed to fetch AI models:", res.status, res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.warn("Error loading AI models (API might be down):", error);
    return [];
  }
}

export default async function AiModelsPage() {
  const aiModels = await getAiModels();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          AI Models
        </h1>
        <CreateAiModelModal />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Key
                </th>
                <th scope="col" className="px-6 py-3">
                  ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {aiModels.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No AI models found.
                  </td>
                </tr>
              ) : (
                aiModels.map((model) => (
                  <tr
                    key={model.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {model.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {model.key}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {model.id}
                    </td>
                    <td className="px-6 py-4">
                      {model.created_at
                        ? new Date(model.created_at).toLocaleDateString()
                        : "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
