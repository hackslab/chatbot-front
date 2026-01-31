"use client";

import { X, AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!open) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      confirmBg: "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
    },
    warning: {
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      confirmBg: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800",
    },
    info: {
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      confirmBg: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="relative z-50 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}>
            <AlertTriangle className={`h-6 w-6 ${styles.iconColor}`} />
          </div>

          <div className="flex-1 pt-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg ${styles.confirmBg} transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
