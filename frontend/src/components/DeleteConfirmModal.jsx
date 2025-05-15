import React from "react";

export default function DeleteConfirmModal({ texto, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-lg">
        <p className="mb-6 text-lg text-gray-800">{texto}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="rounded bg-gray-300 px-4 py-2 font-medium hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
}
