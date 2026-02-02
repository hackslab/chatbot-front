"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Unlink } from "lucide-react";
import { removeDocumentFromApplication } from "@/lib/actions";
import ConfirmDialog from "@/components/ConfirmDialog";

interface RemoveAssignedDocumentButtonProps {
  applicationId: string;
  documentId: string;
}

export default function RemoveAssignedDocumentButton({
  applicationId,
  documentId,
}: RemoveAssignedDocumentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleRemoveClick() {
    setShowConfirm(true);
  }

  async function handleRemove() {
    setShowConfirm(false);

    setLoading(true);
    const result = await removeDocumentFromApplication(
      applicationId,
      documentId,
    );

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Document removed successfully");
    }

    setLoading(false);
  }

  function handleCancelRemove() {
    setShowConfirm(false);
  }

  return (
    <>
      <button
        onClick={handleRemoveClick}
        disabled={loading}
        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-900/20 dark:hover:text-red-300 disabled:opacity-60 transition-colors"
        title="Remove document"
        aria-label="Remove document"
      >
        <Unlink className="h-4 w-4" />
      </button>

      <ConfirmDialog
        open={showConfirm}
        title="Remove Document"
        message="Remove this document from the application?"
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemove}
        onCancel={handleCancelRemove}
        variant="warning"
      />
    </>
  );
}
