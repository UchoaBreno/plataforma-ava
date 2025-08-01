import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function EditAulaModal({ aula, onClose, onSaved, onDeleted }) {
  const [titulo, setTitulo] = useState(aula.titulo);
  const [descricao, setDescricao] = useState(aula.descricao || "");
  const [dataPost, setDataPost] = useState(aula.data || "");
  const [slide, setSlide] = useState(null);
  const [erro, setErro] = useState("");
  const [showDel, setShowDel] = useState(false);

  const salvar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!titulo.trim()) {
      setErro("O campo título é obrigatório.");
      return;
    }

    if (!dataPost.trim()) {
      setErro("A data de postagem é obrigatória.");
      return;
    }

    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descricao", descricao);
    fd.append("data", dataPost);
    if (slide) fd.append("arquivo", slide);

    try {
      await axiosInstance.patch(`aulas/${aula.id}/`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onSaved();
    } catch (err) {
      console.error("Erro ao salvar alterações:", err.response?.data || err);
      setErro("Erro ao salvar alterações. Verifique os dados e tente novamente.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
        <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-3 text-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            ✖
          </button>

          <h2 className="mb-4 text-xl font-semibold text-green-600 dark:text-green-400">
            Editar aula
          </h2>

          {erro && (
            <div className="mb-4 rounded border border-red-500 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-2 text-sm">
              {erro}
            </div>
          )}

          <form
            onSubmit={salvar}
            className="space-y-3 max-h-[65vh] overflow-auto"
          >
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da aula"
            />

            <textarea
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição da aula"
            />

            <input
              type="date"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              value={dataPost}
              onChange={(e) => setDataPost(e.target.value)}
            />

            <div>
              <label className="block mb-1 text-sm">Anexo atual:</label>
              {aula.arquivo ? (
                <a
                  href={aula.arquivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline break-all"
                >
                  {aula.arquivo.split("/").pop()}
                </a>
              ) : (
                <span className="text-sm text-gray-500">Nenhum arquivo anexado.</span>
              )}
            </div>

            <input
              type="file"
              accept=".pdf"
              className="w-full text-sm mt-1"
              onChange={(e) => setSlide(e.target.files[0])}
            />

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowDel(true)}
                className="rounded bg-red-600 hover:bg-red-700 px-4 py-2 font-medium text-white"
              >
                Apagar aula
              </button>

              <button
                type="submit"
                className="rounded bg-green-600 hover:bg-green-700 px-4 py-2 font-medium text-white"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>

      {showDel && (
        <DeleteConfirmModal
          texto={`Apagar a aula “${aula.titulo}”?`}
          onCancel={() => setShowDel(false)}
          onConfirm={async () => {
            try {
              await axiosInstance.delete(`aulas/${aula.id}/`);
              setShowDel(false);
              onDeleted();
            } catch (err) {
              console.error("Erro ao apagar:", err.response?.data || err);
              alert("Erro ao apagar");
            }
          }}
        />
      )}
    </>
  );
}
