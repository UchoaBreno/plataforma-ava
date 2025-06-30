// src/pages/ResponderAtividadeDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function ResponderAtividadeDetail() {
  const { id } = useParams();
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const [atividade, setAtividade] = useState(null);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const fetchAtividade = async () => {
      try {
        const { data } = await axios.get(`http://127.0.0.1:8000/api/atividades/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAtividade(data);
      } catch (err) {
        console.error("Erro ao carregar atividade:", err);
      }
    };

    fetchAtividade();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("Enviando...");

    const formData = new FormData();
    formData.append("atividade", id);
    formData.append("resposta_texto", respostaTexto);
    if (arquivo) formData.append("arquivo", arquivo);

    try {
      await axios.post("http://127.0.0.1:8000/api/entregas/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
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
    <div className="flex">
      <Sidebar isAluno={true} isStaff={false} />
      <main className="ml-64 flex-1 bg-gray-900 text-white p-6">
        {atividade ? (
          <div>
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              Responder Atividade: {atividade.titulo}
            </h1>
            <p className="mb-2">{atividade.descricao}</p>
            <p className="text-sm text-gray-400 mb-6">
              Prazo: {atividade.data_entrega} até {atividade.hora_entrega}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Resposta em texto:</label>
                <textarea
                  value={respostaTexto}
                  onChange={(e) => setRespostaTexto(e.target.value)}
                  className="w-full h-32 p-2 rounded bg-gray-800 text-white border border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Enviar arquivo (opcional):</label>
                <input
                  type="file"
                  onChange={(e) => setArquivo(e.target.files[0])}
                  className="text-white"
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
                    <span className="text-green-400">{mensagem}</span>
                  ) : (
                    <span className="text-red-400">{mensagem}</span>
                  )}
                </p>
              )}
            </form>
          </div>
        ) : (
          <p>Carregando atividade...</p>
        )}
      </main>
    </div>
  );
}
