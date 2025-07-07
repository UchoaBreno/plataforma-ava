import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AtividadeCreate() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("");
  const [pontos, setPontos] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("data_entrega", dataEntrega);
    formData.append("hora_entrega", horaEntrega);
    formData.append("pontos", pontos);
    if (arquivo) formData.append("arquivo", arquivo);

    try {
      await axios.post("http://127.0.0.1:8000/api/atividades/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/atividades");
    } catch (err) {
      console.error("Erro ao criar atividade:", err);
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
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
          >
            Criar Atividade
          </button>
        </div>
      </main>
    </div>
  );
}
