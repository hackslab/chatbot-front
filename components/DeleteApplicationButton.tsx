"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteApplication } from "@/lib/actions";
import ConfirmDialog from "@/components/ConfirmDialog";

interface DeleteApplicationButtonProps {
  applicationId: string;
}

export default function DeleteApplicationButton({
  applicationId,
}: DeleteApplicationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDeleteClick() {
    setShowConfirm(true);
  }

  async function handleDelete() {
    setShowConfirm(false);

    setLoading(true);
    const result = await deleteApplication(applicationId);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Application deleted successfully");
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
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-60"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Application"
        message="Delete this application? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
}
