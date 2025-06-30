import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CriarQuiz() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [link, setLink] = useState("");
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!token) {
      alert("Sessão expirada. Faça login novamente.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", titulo);
    formData.append("description", descricao);
    if (arquivo) formData.append("arquivo", arquivo);
    if (link) formData.append("link_interativo", link);

    try {
      await axios.post("http://127.0.0.1:8000/api/quizzes/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/quizzes");
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Token expirado ou inválido. Faça login novamente.");
        localStorage.removeItem("access");
        navigate("/login");
      } else {
        console.error("Erro ao criar quiz:", err);
      }
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

      <h1 className="text-2xl font-bold text-green-400 mb-4">Criar Novo Quiz</h1>

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
        placeholder="Descrição do quiz"
      />

      <label className="block mb-1 text-sm">Arquivo (PDF, imagem...)</label>
      <input
        type="file"
        onChange={(e) => setArquivo(e.target.files[0])}
        className="w-full mb-4 text-black"
      />

      <label className="block mb-1 text-sm">Link Interativo</label>
      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
        placeholder="https://exemplo.com/jogo"
      />

      <button
        onClick={handleSubmit}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
      >
        Criar Quiz
      </button>
    </div>
  );
}
