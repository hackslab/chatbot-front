"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteFolder } from "@/lib/actions";
import ConfirmDialog from "@/components/ConfirmDialog";

interface DeleteFolderButtonProps {
  folderId: string;
  iconOnly?: boolean;
  className?: string;
}

export default function DeleteFolderButton({
  folderId,
  iconOnly = false,
  className = "",
}: DeleteFolderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerClassName = iconOnly
    ? `inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors disabled:opacity-60 ${className}`
    : `text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-60 ${className}`;

  function handleDeleteClick() {
    setShowConfirm(true);
  }

  async function handleDelete() {
    setShowConfirm(false);

    setLoading(true);
    const result = await deleteFolder(folderId);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Folder and files deleted successfully");
    }

    setLoading(false);
  }

  function handleCancelDelete() {
    setShowConfirm(false);
  }

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={loading}
        className={triggerClassName}
        aria-label={iconOnly ? "Delete folder" : undefined}
        title={iconOnly ? "Delete folder" : undefined}
      >
        {iconOnly ? <Trash2 className="h-4 w-4" /> : loading ? "Deleting..." : "Delete"}
      </button>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Folder and Files"
        message="Delete this folder and all files inside? This action cannot be undone."
        confirmText="Delete Folder"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
}
