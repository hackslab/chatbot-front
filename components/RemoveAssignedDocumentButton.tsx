"use client";

import { useState } from "react";
import { toast } from "sonner";
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
    const result = await removeDocumentFromApplication(applicationId, documentId);

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
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-60"
      >
        {loading ? "Removing..." : "Remove"}
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
