import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";

export default function ForumProfessor() {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [respostaAtiva, setRespostaAtiva] = useState(null);
  const [novaResposta, setNovaResposta] = useState("");
  const [editando, setEditando] = useState({ id: null, texto: "", isResposta: false, comentarioPaiId: null });
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.username || decoded.name || "Usuário");
    } catch {
      navigate("/login");
      return;
    }
    fetchComentarios();
  }, [navigate]);

  const fetchComentarios = async () => {
    try {
      const { data } = await axiosInstance.get("forum/");
      setComentarios(data);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    }
  };

  const adicionarComentario = async () => {
    if (!novoComentario.trim()) return;
    try {
      await axiosInstance.post("forum/", { texto: novoComentario });
      setNovoComentario("");
      fetchComentarios();
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
    }
  };

  const enviarResposta = async (comentarioId) => {
    if (!novaResposta.trim()) return;
    try {
      await axiosInstance.post(`forum/${comentarioId}/responder/`, {
        texto: novaResposta,
      });
      setNovaResposta("");
      setRespostaAtiva(null);
      fetchComentarios();
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    }
  };

  const apagar = async (id, isResposta = false, comentarioPaiId = null) => {
    try {
      const url = isResposta
        ? `forum/respostas/${id}/`
        : `forum/${id}/`;
      await axiosInstance.delete(url);
      fetchComentarios();
    } catch (err) {
      console.error("Erro ao apagar:", err);
    }
  };

  const iniciarEdicao = (id, texto, isResposta = false, comentarioPaiId = null) => {
    setEditando({ id, texto, isResposta, comentarioPaiId });
  };

  const salvarEdicao = async () => {
    const { id, texto, isResposta } = editando;
    if (!texto.trim()) return;
    try {
      const url = isResposta
        ? `forum/respostas/${id}/`
        : `forum/${id}/`;
      await axiosInstance.put(url, { texto });
      setEditando({ id: null, texto: "", isResposta: false, comentarioPaiId: null });
      fetchComentarios();
    } catch (err) {
      console.error("Erro ao editar:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 max-w-4xl mx-auto relative">
      <Sidebar isStaff />
      <main className="ml-64 flex-1 p-4 sm:p-6 max-w-4xl mx-auto relative">
        <button
          className="absolute top-4 right-4 text-xs sm:text-sm bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 px-3 py-1 rounded"
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>

        <h1 className="text-xl sm:text-2xl font-bold mb-4">Fórum</h1>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Digite seu comentário"
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded p-2 text-sm bg-white dark:bg-gray-800 text-black dark:text-gray-100"
          />
          <button
            onClick={adicionarComentario}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Enviar
          </button>
        </div>

        {comentarios.map((comentario) => (
          <div key={comentario.id} className="mb-6 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded shadow-sm">
            <p className="font-semibold break-words">{comentario.autor_nome} comentou:</p>

            {editando.id === comentario.id && !editando.isResposta ? (
              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <input
                  type="text"
                  value={editando.texto}
                  onChange={(e) => setEditando({ ...editando, texto: e.target.value })}
                  className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded p-1 text-sm text-black dark:text-gray-100"
                />
                <button onClick={salvarEdicao} className="text-blue-600 dark:text-blue-400 text-xs">
                  Salvar
                </button>
              </div>
            ) : (
              <p className="mb-1 break-words">{comentario.texto}</p>
            )}

            <div className="flex flex-wrap gap-3 text-xs mb-2">
              <button
                onClick={() => setRespostaAtiva(comentario.id)}
                className="text-green-700 dark:text-green-400"
              >
                Responder
              </button>
              {comentario.autor_nome === username && (
                <>
                  <button
                    onClick={() => iniciarEdicao(comentario.id, comentario.texto)}
                    className="text-blue-700 dark:text-blue-400"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => apagar(comentario.id)}
                    className="text-red-700 dark:text-red-400"
                  >
                    Apagar
                  </button>
                </>
              )}
            </div>

            {respostaAtiva === comentario.id && (
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={novaResposta}
                  onChange={(e) => setNovaResposta(e.target.value)}
                  placeholder="Digite sua resposta"
                  className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded p-1 text-xs text-black dark:text-gray-100"
                />
                <button
                  onClick={() => enviarResposta(comentario.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 rounded text-xs"
                >
                  Enviar
                </button>
              </div>
            )}

            <div className="ml-4 mt-2 space-y-1">
              {comentario.respostas.map((resposta) => (
                <div key={resposta.id} className="text-xs text-gray-800 dark:text-gray-300">
                  <span className="font-semibold">{resposta.autor_nome}</span> respondeu:
                  {editando.id === resposta.id && editando.isResposta ? (
                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                      <input
                        type="text"
                        value={editando.texto}
                        onChange={(e) => setEditando({ ...editando, texto: e.target.value })}
                        className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded p-1 text-xs text-black dark:text-gray-100"
                      />
                      <button onClick={salvarEdicao} className="text-blue-600 dark:text-blue-400 text-xs">
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <span className="ml-1 break-words">{resposta.texto}</span>
                  )}
                  {resposta.autor_nome === username && (
                    <div className="flex flex-wrap gap-2 ml-4 mt-1 text-xs">
                      <button
                        onClick={() => iniciarEdicao(resposta.id, resposta.texto, true, comentario.id)}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => apagar(resposta.id, true)}
                        className="text-red-600 dark:text-red-400"
                      >
                        Apagar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
