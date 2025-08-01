import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function AtividadeCreate() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("");
  const [pontos, setPontos] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setErro("");

    if (!titulo.trim()) {
      setErro("O campo título é obrigatório.");
      return;
    }

    if (!dataEntrega.trim()) {
      setErro("A data de entrega é obrigatória.");
      return;
    }

    if (!horaEntrega.trim()) {
      setErro("A hora de entrega é obrigatória.");
      return;
    }

    if (!pontos.trim()) {
      setErro("A pontuação da atividade é obrigatória.");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("data_entrega", dataEntrega);
    formData.append("hora_entrega", horaEntrega);
    formData.append("pontos", pontos);
    if (arquivo) formData.append("arquivo", arquivo);

    try {
      setLoading(true);
      await axiosInstance.post("atividades/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/atividades");
    } catch (err) {
      console.error("Erro ao criar atividade:", err.response?.data || err);
      setErro("Erro ao criar atividade. Verifique os campos e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isStaff />
      <main className="ml-64 flex-1 p-6 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-sm bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-black dark:text-gray-100 px-4 py-2 rounded"
        >
          Voltar
        </button>

        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">
          Criar Nova Atividade
        </h1>

        <div className="max-w-lg space-y-4">
          {erro && (
            <div className="rounded border border-red-500 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-2 text-sm">
              {erro}
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
              placeholder="Digite o título"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
              placeholder="Descrição da atividade"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Data de Entrega</label>
            <input
              type="date"
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Hora de Entrega</label>
            <input
              type="time"
              value={horaEntrega}
              onChange={(e) => setHoraEntrega(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Pontuação</label>
            <input
              type="number"
              value={pontos}
              onChange={(e) => setPontos(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
              placeholder="Ex: 10"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Arquivo (PDF, imagem...)</label>
            <input
              type="file"
              onChange={(e) => setArquivo(e.target.files[0])}
              className="w-full text-black dark:text-gray-100"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Atividade"}
          </button>
        </div>
      </main>
    </div>
  );
}
