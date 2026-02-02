"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAiModel } from "@/lib/actions";
import ConfirmDialog from "@/components/ConfirmDialog";

interface DeleteAiModelButtonProps {
  modelId: string;
  iconOnly?: boolean;
}

export default function DeleteAiModelButton({
  modelId,
  iconOnly = false,
}: DeleteAiModelButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDeleteClick() {
    setShowConfirm(true);
  }

  async function handleDelete() {
    setShowConfirm(false);

    setLoading(true);
    const result = await deleteAiModel(modelId);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("AI Model deleted successfully");
      router.refresh();
    }

    setLoading(false);
  }

  function handleCancelDelete() {
    setShowConfirm(false);
  }

  return (
    <>
      {iconOnly ? (
        <button
          onClick={handleDeleteClick}
          disabled={loading}
          className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-900/20 dark:hover:text-red-300 disabled:opacity-60"
          title={loading ? "Deleting..." : "Delete AI Model"}
          aria-label={loading ? "Deleting AI Model" : "Delete AI Model"}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={handleDeleteClick}
          disabled={loading}
          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-60"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Delete AI Model"
        message="Delete this AI Model? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
}
