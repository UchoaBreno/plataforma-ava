import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CriarAulaModal({ isOpen, onClose, onSaved }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataPostagem, setDataPostagem] = useState("");
  const [agendar, setAgendar] = useState(false);
  const [dataAgendada, setDataAgendada] = useState("");
  const [linkReuniao, setLinkReuniao] = useState("");
  const [slide, setSlide] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitulo("");
      setDescricao("");
      setDataPostagem("");
      setAgendar(false);
      setDataAgendada("");
      setLinkReuniao("");
      setSlide(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const token = localStorage.getItem("access");
    if (!token) {
      alert("Você não está autenticado. Faça login novamente.");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("data_postagem", dataPostagem);
    formData.append("agendada", agendar);
    if (agendar && dataAgendada) formData.append("data_agendada", dataAgendada);
    if (linkReuniao) formData.append("link_reuniao", linkReuniao);
    if (slide) formData.append("slide", slide);

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/api/aulas/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (onSaved) onSaved(res.data);
      onClose();
    } catch (err) {
      console.error("Erro ao criar aula:", err.response?.data || err.message);
      alert("Erro ao publicar aula. Confira os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
      <div className="w-full max-w-xl rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-semibold text-green-600 dark:text-green-400">
          Criar Nova Aula
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título da aula"
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
            required
          />

          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição"
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          />

          <label className="block text-sm">
            Data de postagem:
            <input
              type="date"
              value={dataPostagem}
              onChange={(e) => setDataPostagem(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              required
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={agendar}
              onChange={(e) => setAgendar(e.target.checked)}
            />
            Agendar aula
          </label>

          {agendar && (
            <input
              type="datetime-local"
              value={dataAgendada}
              onChange={(e) => setDataAgendada(e.target.value)}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
            />
          )}

          <input
            type="url"
            value={linkReuniao}
            onChange={(e) => setLinkReuniao(e.target.value)}
            placeholder="Link da reunião (opcional)"
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          />

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSlide(e.target.files[0])}
            className="w-full text-sm"
          />

          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-green-600 hover:bg-green-700 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Publicando..." : "Publicar Aula"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 px-4 py-2 text-black dark:text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
