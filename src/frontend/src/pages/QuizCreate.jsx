import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function CriarQuiz() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [link, setLink] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();  // Evita o comportamento padrão de submit

    setErro("");  // Limpa os erros anteriores

    // Valida os campos obrigatórios
    if (!titulo.trim() || !descricao.trim()) {
      setErro("Preencha pelo menos o título e a descrição do quiz.");
      return;
    }

    // Cria um objeto FormData para envio
    const formData = new FormData();
    formData.append("title", titulo);
    formData.append("description", descricao);

    // Adiciona o arquivo ao FormData, se houver
    if (arquivo) {
      formData.append("pdf", arquivo);  // Usando "pdf" conforme o backend
    }

    // Adiciona o link, se houver
    if (link) {
      formData.append("link_interativo", link);
    }

    try {
      // Envia os dados do quiz via POST para o backend
      await axiosInstance.post("quizzes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Quiz criado com sucesso!");
      navigate("/quizzes");
    } catch (err) {
      console.error("Erro ao criar quiz:", err);
      const msg =
        err.response?.data?.detail ||
        "Ocorreu um erro ao criar o quiz. Verifique os dados e tente novamente.";
      setErro("❌ " + msg);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar isStaff />

      <main className="ml-64 flex-1 p-6 relative">
        {/* Botão de voltar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-sm bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-black dark:text-gray-100 px-4 py-2 rounded"
        >
          Voltar
        </button>

        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">
          Criar Novo Quiz
        </h1>

        {erro && (
          <div className="text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600 px-4 py-2 rounded text-center mb-4 text-sm">
            {erro}
          </div>
        )}

        <div className="max-w-xl space-y-4">
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
              placeholder="Descrição do quiz"
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

          <div>
            <label className="block mb-1 text-sm">Link Interativo</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
              placeholder="https://exemplo.com/jogo"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
          >
            Criar Quiz
          </button>
        </div>
      </main>
    </div>
  );
}
