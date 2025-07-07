import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function ForumAluno() {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [respostaAtiva, setRespostaAtiva] = useState(null);
  const [novaResposta, setNovaResposta] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");
  const [username, setUsername] = useState("");
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username || decoded.name || "Usuário");
      fetchComentarios();
    }
  }, []);

  const fetchComentarios = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/forum/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComentarios(data);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    }
  };

  const adicionarComentario = async () => {
    if (!novoComentario.trim()) return;
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/forum/",
        { texto: novoComentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNovoComentario("");
      fetchComentarios();
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
    }
  };

  const enviarResposta = async (comentarioId) => {
    if (!novaResposta.trim()) return;
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/forum/${comentarioId}/responder/`,
        { texto: novaResposta },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNovaResposta("");
      setRespostaAtiva(null);
      fetchComentarios();
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    }
  };

  const apagarComentario = async (id, isResposta = false, comentarioPaiId = null) => {
    try {
      const url = isResposta
        ? `http://127.0.0.1:8000/api/forum/${comentarioPaiId}/resposta/${id}/`
        : `http://127.0.0.1:8000/api/forum/${id}/`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComentarios();
    } catch (err) {
      console.error("Erro ao apagar:", err);
    }
  };

  const iniciarEdicao = (id, texto) => {
    setEditandoId(id);
    setTextoEditado(texto);
  };

  const salvarEdicao = async (id, isResposta = false, comentarioPaiId = null) => {
    try {
      const url = isResposta
        ? `http://127.0.0.1:8000/api/forum/${comentarioPaiId}/resposta/${id}/`
        : `http://127.0.0.1:8000/api/forum/${id}/`;
      await axios.put(
        url,
        { texto: textoEditado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditandoId(null);
      setTextoEditado("");
      fetchComentarios();
    } catch (err) {
      console.error("Erro ao editar:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 max-w-3xl mx-auto relative">
      <button
        className="absolute top-4 right-4 text-sm bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 px-4 py-2 rounded"
        onClick={() => navigate(-1)}
      >
        Voltar
      </button>

      <h1 className="text-2xl font-bold mb-4">Fórum</h1>
      <h2 className="text-xl font-semibold mb-2">Comentários</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Digite seu comentário"
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded p-2 text-black dark:text-gray-100"
        />
        <button
          onClick={adicionarComentario}
          className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
        >
          Enviar
        </button>
      </div>

      {comentarios.map((comentario) => (
        <div key={comentario.id} className="mb-6">
          <p className="font-semibold">{comentario.autor_nome} comentou</p>
          {editandoId === comentario.id ? (
            <>
              <input
                type="text"
                value={textoEditado}
                onChange={(e) => setTextoEditado(e.target.value)}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded p-1 w-full my-1 text-black dark:text-gray-100"
              />
              <button
                onClick={() => salvarEdicao(comentario.id)}
                className="text-blue-600 dark:text-blue-400 text-sm mr-2"
              >
                Salvar
              </button>
            </>
          ) : (
            <p className="mb-1">{comentario.texto}</p>
          )}

          <div className="flex gap-4 text-sm mb-2">
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
                  onClick={() => apagarComentario(comentario.id)}
                  className="text-red-700 dark:text-red-400"
                >
                  Apagar
                </button>
              </>
            )}
          </div>

          {respostaAtiva === comentario.id && (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={novaResposta}
                onChange={(e) => setNovaResposta(e.target.value)}
                placeholder="Digite sua resposta"
                className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded p-2 text-sm text-black dark:text-gray-100"
              />
              <button
                onClick={() => enviarResposta(comentario.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 rounded text-sm"
              >
                Enviar
              </button>
            </div>
          )}

          <div className="ml-4 mt-2">
            {comentario.respostas.map((resposta) => (
              <div key={resposta.id} className="text-sm text-gray-800 dark:text-gray-300 mb-1">
                <span className="font-semibold">{resposta.autor_nome}</span> respondeu:
                {editandoId === resposta.id ? (
                  <>
                    <input
                      type="text"
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded p-1 w-full my-1 text-black dark:text-gray-100"
                    />
                    <button
                      onClick={() =>
                        salvarEdicao(resposta.id, true, comentario.id)
                      }
                      className="text-blue-600 dark:text-blue-400 text-sm mr-2"
                    >
                      Salvar
                    </button>
                  </>
                ) : (
                  <> {resposta.texto}</>
                )}
                {resposta.autor_nome === username && (
                  <div className="flex gap-2 ml-4 text-xs">
                    <button
                      onClick={() =>
                        iniciarEdicao(resposta.id, resposta.texto)
                      }
                      className="text-blue-600 dark:text-blue-400"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        apagarComentario(resposta.id, true, comentario.id)
                      }
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
    </div>
  );
}
