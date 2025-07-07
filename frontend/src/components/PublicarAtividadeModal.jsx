import React from "react";

export default function PublicarAtividadeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
      <div className="w-full max-w-md rounded bg-white dark:bg-gray-800 text-black dark:text-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-green-600 dark:text-green-400">
          Publicar Atividade
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Funcionalidade em desenvolvimento.
        </p>
        <button
          onClick={onClose}
          className="rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 px-4 py-2 text-black dark:text-white"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
