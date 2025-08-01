import React from "react";

export default function DeleteConfirmModal({ texto, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-2">
      <div className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-6 text-center shadow-lg">
        <p className="mb-6 text-lg">{texto}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 px-4 py-2 font-medium text-black dark:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-red-600 hover:bg-red-700 px-4 py-2 font-medium text-white"
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
}
