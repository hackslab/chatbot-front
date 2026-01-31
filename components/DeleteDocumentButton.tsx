"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDocument } from "@/lib/actions";
import ConfirmDialog from "@/components/ConfirmDialog";

interface DeleteDocumentButtonProps {
  documentId: string;
  iconOnly?: boolean;
  className?: string;
}

export default function DeleteDocumentButton({
  documentId,
  iconOnly = false,
  className = "",
}: DeleteDocumentButtonProps) {
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
    const result = await deleteDocument(documentId);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Document deleted successfully");
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
        aria-label={iconOnly ? "Delete document" : undefined}
        title={iconOnly ? "Delete document" : undefined}
      >
        {iconOnly ? <Trash2 className="h-4 w-4" /> : loading ? "Deleting..." : "Delete"}
      </button>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Document"
        message="Delete this document permanently? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
}
