import React from "react";

export default function PublicarAtividadeModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Publicar Atividade</h2>
        <p className="mb-6 text-gray-600">
          Funcionalidade em desenvolvimento.
        </p>
        <button
          onClick={onClose}
          className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
