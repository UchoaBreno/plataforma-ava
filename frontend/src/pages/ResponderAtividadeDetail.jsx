import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function ResponderAtividadeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [atividade, setAtividade] = useState(null);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtividade = async () => {
      try {
        const { data } = await axiosInstance.get(`atividades/${id}/`);
        setAtividade(data);
      } catch (err) {
        console.error("Erro ao carregar atividade:", err);
        setMensagem("Erro ao carregar atividade.");
      } finally {
        setLoading(false);
      }
    };

    fetchAtividade();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("Enviando...");

    const formData = new FormData();
    formData.append("atividade", id);
    formData.append("resposta_texto", respostaTexto);
    if (arquivo) formData.append("arquivo", arquivo);

    try {
      await axiosInstance.post("entregas/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMensagem("Atividade enviada com sucesso!");
      setRespostaTexto("");
      setArquivo(null);
      setTimeout(() => navigate("/atividades"), 2000);
    } catch (err) {
      console.error("Erro ao enviar atividade:", err);
      setMensagem("Erro ao enviar atividade.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-6">
        {loading ? (
          <p>Carregando atividade...</p>
        ) : atividade ? (
          <div>
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
              Responder Atividade: {atividade.titulo}
            </h1>
            <p className="mb-2">{atividade.descricao}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Prazo: {atividade.data_entrega} até {atividade.hora_entrega}
            </p>

            {atividade.arquivo && (
              <p className="mb-4">
                Arquivo do professor:{" "}
                <a
                  href={
                    atividade.arquivo.startsWith("http")
                      ? atividade.arquivo
                      : `http://127.0.0.1:8000${atividade.arquivo}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  Clique aqui para abrir
                </a>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Resposta em texto:</label>
                <textarea
                  value={respostaTexto}
                  onChange={(e) => setRespostaTexto(e.target.value)}
                  className="w-full h-32 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Enviar arquivo (opcional):</label>
                <input
                  type="file"
                  onChange={(e) => setArquivo(e.target.files[0])}
                  className="text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Enviar Atividade
              </button>

              {mensagem && (
                <p className="mt-4 text-sm">
                  {mensagem.includes("sucesso") ? (
                    <span className="text-green-500">{mensagem}</span>
                  ) : (
                    <span className="text-red-500">{mensagem}</span>
                  )}
                </p>
              )}
            </form>
          </div>
        ) : (
          <p>Atividade não encontrada.</p>
        )}
      </main>
    </div>
  );
}
