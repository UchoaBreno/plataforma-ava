import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <div className="p-6 ml-64 text-white relative">
      {/* Botão de voltar */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-sm bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded"
      >
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-green-400 mb-4">Criar Nova Atividade</h1>

      <label className="block mb-1 text-sm">Título</label>
      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
        placeholder="Digite o título"
      />

      <label className="block mb-1 text-sm">Descrição</label>
      <textarea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
        placeholder="Descrição da atividade"
      />

      <label className="block mb-1 text-sm">Data de Entrega</label>
      <input
        type="date"
        value={dataEntrega}
        onChange={(e) => setDataEntrega(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
      />

      <label className="block mb-1 text-sm">Hora de Entrega</label>
      <input
        type="time"
        value={horaEntrega}
        onChange={(e) => setHoraEntrega(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
      />

      <label className="block mb-1 text-sm">Pontuação</label>
      <input
        type="number"
        value={pontos}
        onChange={(e) => setPontos(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
        placeholder="Ex: 10"
      />

      <label className="block mb-1 text-sm">Arquivo (PDF, imagem...)</label>
      <input
        type="file"
        onChange={(e) => setArquivo(e.target.files[0])}
        className="w-full mb-4 text-black"
      />

      <button
        onClick={handleSubmit}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
      >
        Criar Atividade
      </button>
    </div>
  );
}
