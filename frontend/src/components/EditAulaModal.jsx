import React, { useState } from "react";
import axios from "axios";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function EditAulaModal({ aula, onClose, onSaved, onDeleted }) {
  const token = localStorage.getItem("access");
  const auth  = { headers: { Authorization: `Bearer ${token}` } };

  const [titulo,     setTitulo]    = useState(aula.titulo);
  const [descricao,  setDescricao] = useState(aula.descricao || "");
  const [dataPost,   setDataPost]  = useState(aula.data_postagem);
  const [slide,      setSlide]     = useState(null);
  const [showDel,    setShowDel]   = useState(false);          // pop‑up apagar

  const salvar = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descricao", descricao);
    fd.append("data_postagem", dataPost);
    if (slide) fd.append("slide", slide);

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/aulas/${aula.id}/`,
        fd,
        auth
      );
      onSaved();        // volta para a lista
    } catch {
      alert("Erro ao salvar alterações");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-3 text-lg text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>

          <h2 className="mb-4 text-xl font-semibold text-green-600">
            Editar aula
          </h2>

          <form onSubmit={salvar} className="space-y-3 max-h-[65vh] overflow-auto">
            <input
              className="w-full rounded border px-3 py-2"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
            <textarea
              className="w-full rounded border px-3 py-2"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <input
              type="date"
              className="w-full rounded border px-3 py-2"
              value={dataPost}
              onChange={(e) => setDataPost(e.target.value)}
              required
            />
            <input
              type="file"
              accept=".pdf"
              className="w-full"
              onChange={(e) => setSlide(e.target.files[0])}
            />

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowDel(true)}
                className="rounded bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
              >
                Apagar aula
              </button>

              <button
                type="submit"
                className="rounded bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* confirmação de deleção */}
      {showDel && (
        <DeleteConfirmModal
          texto={`Apagar a aula “${aula.titulo}”?`}
          onCancel={() => setShowDel(false)}
          onConfirm={async () => {
            try {
              await axios.delete(
                `http://127.0.0.1:8000/api/aulas/${aula.id}/`,
                auth
              );
              setShowDel(false);
              onDeleted(); // volta para lista e recarrega
            } catch {
              alert("Erro ao apagar");
            }
          }}
        />
      )}
    </>
  );
}
