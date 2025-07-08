import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function AdminDashboard() {
  const [tab, setTab] = useState("solicitacoes");
  const [loading, setLoading] = useState(false);

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [desempenhos, setDesempenhos] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetchSolicitacoes();
    fetchUsuarios();
    fetchAulas();
    fetchAtividades();
    fetchQuizzes();
    fetchDesempenhos();
  };

  const fetchSolicitacoes = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("admin/solicitacoes-professor/");
      setSolicitacoes(data);
    } catch (err) {
      console.error("Erro ao buscar solicitações", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("usuarios/");
      setUsuarios(data);
    } catch (err) {
      console.error("Erro ao buscar usuários", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAulas = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("aulas/");
      setAulas(data);
    } catch (err) {
      console.error("Erro ao buscar aulas", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAtividades = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("atividades/");
      setAtividades(data);
    } catch (err) {
      console.error("Erro ao buscar atividades", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("quizzes/");
      setQuizzes(data);
    } catch (err) {
      console.error("Erro ao buscar quizzes", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesempenhos = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("desempenhos/");
      setDesempenhos(data);
    } catch (err) {
      console.error("Erro ao buscar desempenhos", err);
    } finally {
      setLoading(false);
    }
  };

  const aprovarSolicitacao = async (id) => {
    await axiosInstance.post(`admin/solicitacoes-professor/${id}/aprovar/`);
    fetchSolicitacoes();
  };

  const rejeitarSolicitacao = async (id) => {
    await axiosInstance.post(`admin/solicitacoes-professor/${id}/rejeitar/`);
    fetchSolicitacoes();
  };

  const deleteItem = async (endpoint, id) => {
    await axiosInstance.delete(`${endpoint}/${id}/`);
    fetchAll();
  };

  const renderTab = () => {
    if (loading) return <p>🔄 Carregando...</p>;

    switch (tab) {
      case "solicitacoes":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Solicitações de Professores</h2>
            {solicitacoes.map((s) => (
              <div key={s.id} className="border p-3 mb-2 rounded bg-white dark:bg-gray-800">
                <p>
                  {s.nome} {s.sobrenome} - {s.email}
                </p>
                <p>Status: {s.aprovado ? "✅ Aprovado" : "⏳ Pendente"}</p>
                {!s.aprovado && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => aprovarSolicitacao(s.id)} className="bg-green-600 text-white px-3 py-1 rounded">
                      Aprovar
                    </button>
                    <button onClick={() => rejeitarSolicitacao(s.id)} className="bg-red-600 text-white px-3 py-1 rounded">
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "usuarios":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Usuários</h2>
            {usuarios.map((u) => (
              <div key={u.id} className="border p-3 mb-2 rounded bg-white dark:bg-gray-800 flex justify-between">
                <span>{u.username} ({u.is_staff ? "Professor" : "Aluno"})</span>
                <button onClick={() => deleteItem("usuarios", u.username)} className="bg-red-600 text-white px-3 py-1 rounded">
                  Deletar
                </button>
              </div>
            ))}
          </div>
        );

      case "aulas":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Aulas</h2>
            {aulas.map((a) => (
              <div key={a.id} className="border p-3 mb-2 rounded bg-white dark:bg-gray-800 flex justify-between">
                <span>{a.titulo}</span>
                <button onClick={() => deleteItem("aulas", a.id)} className="bg-red-600 text-white px-3 py-1 rounded">
                  Deletar
                </button>
              </div>
            ))}
          </div>
        );

      case "atividades":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Atividades</h2>
            {atividades.map((a) => (
              <div key={a.id} className="border p-3 mb-2 rounded bg-white dark:bg-gray-800 flex justify-between">
                <span>{a.titulo}</span>
                <button onClick={() => deleteItem("atividades", a.id)} className="bg-red-600 text-white px-3 py-1 rounded">
                  Deletar
                </button>
              </div>
            ))}
          </div>
        );

      case "quizzes":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Quizzes</h2>
            {quizzes.map((q) => (
              <div key={q.id} className="border p-3 mb-2 rounded bg-white dark:bg-gray-800 flex justify-between">
                <span>{q.title}</span>
                <button onClick={() => deleteItem("quizzes", q.id)} className="bg-red-600 text-white px-3 py-1 rounded">
                  Deletar
                </button>
              </div>
            ))}
          </div>
        );

      case "desempenhos":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Desempenhos</h2>
            {desempenhos.map((d) => (
              <div key={d.id} className="border p-3 mb-2 rounded bg-white dark:bg-gray-800">
                <p>{d.titulo} - Nota: {d.nota}</p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("solicitacoes")} className="px-3 py-1 bg-green-600 text-white rounded">
          Solicitações
        </button>
        <button onClick={() => setTab("usuarios")} className="px-3 py-1 bg-green-600 text-white rounded">
          Usuários
        </button>
        <button onClick={() => setTab("aulas")} className="px-3 py-1 bg-green-600 text-white rounded">
          Aulas
        </button>
        <button onClick={() => setTab("atividades")} className="px-3 py-1 bg-green-600 text-white rounded">
          Atividades
        </button>
        <button onClick={() => setTab("quizzes")} className="px-3 py-1 bg-green-600 text-white rounded">
          Quizzes
        </button>
        <button onClick={() => setTab("desempenhos")} className="px-3 py-1 bg-green-600 text-white rounded">
          Desempenhos
        </button>
      </div>

      {renderTab()}
    </div>
  );
}
