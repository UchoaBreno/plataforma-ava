// src/components/CriarAulaModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CriarAulaModal({ isOpen, onClose, onSaved }) {
  /* ───────────── estados ───────────── */
  const [titulo,         setTitulo]        = useState("");
  const [descricao,      setDescricao]     = useState("");
  const [dataPostagem,   setDataPostagem]  = useState("");
  const [agendar,        setAgendar]       = useState(false);
  const [dataAgendada,   setDataAgendada]  = useState("");
  const [linkReuniao,    setLinkReuniao]   = useState("");
  const [slide,          setSlide]         = useState(null);
  const [loading,        setLoading]       = useState(false);

  /* Zera campos sempre que o modal é aberto/fechado */
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

  /* ─────────── submit ─────────── */
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
    if (linkReuniao)            formData.append("link_reuniao", linkReuniao);
    if (slide)                  formData.append("slide", slide);

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/api/aulas/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // avisa o componente pai
      if (onSaved) onSaved(res.data);

      onClose(); // fecha modal
    } catch (err) {
      console.error("Erro ao criar aula:", err.response?.data || err.message);
      alert("Erro ao publicar aula. Confira os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl rounded bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-green-600">
          Criar Nova Aula
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título da aula"
            className="w-full rounded border px-3 py-2"
            required
          />

          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição"
            className="w-full rounded border px-3 py-2"
          />

          <label className="block">
            Data de postagem:
            <input
              type="date"
              value={dataPostagem}
              onChange={(e) => setDataPostagem(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </label>

          <label className="flex items-center gap-2">
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
              className="w-full rounded border px-3 py-2"
            />
          )}

          <input
            type="url"
            value={linkReuniao}
            onChange={(e) => setLinkReuniao(e.target.value)}
            placeholder="Link da reunião (opcional)"
            className="w-full rounded border px-3 py-2"
          />

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSlide(e.target.files[0])}
            className="w-full"
          />

          {/* Botões */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Publicando..." : "Publicar Aula"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
