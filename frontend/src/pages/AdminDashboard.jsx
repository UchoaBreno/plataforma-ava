import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard() {
  const [tab, setTab] = useState("solicitacoes");
  const [loading, setLoading] = useState(false);

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [desempenhos, setDesempenhos] = useState([]);
  const [editandoUsuario, setEditandoUsuario] = useState(null);

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
    try {
      const { data } = await axiosInstance.get("usuarios/");
      setUsuarios(data);
    } catch (err) {
      console.error("Erro ao buscar usuários", err);
    }
  };

  const fetchAulas = async () => {
    try {
      const { data } = await axiosInstance.get("aulas/");
      setAulas(data);
    } catch (err) {
      console.error("Erro ao buscar aulas", err);
    }
  };

  const fetchAtividades = async () => {
    try {
      const { data } = await axiosInstance.get("atividades/");
      setAtividades(data);
    } catch (err) {
      console.error("Erro ao buscar atividades", err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data } = await axiosInstance.get("quizzes/");
      setQuizzes(data);
    } catch (err) {
      console.error("Erro ao buscar quizzes", err);
    }
  };

  const fetchDesempenhos = async () => {
    try {
      const { data } = await axiosInstance.get("desempenhos/");
      setDesempenhos(data);
    } catch (err) {
      console.error("Erro ao buscar desempenhos", err);
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
    if (!window.confirm("Tem certeza que deseja deletar?")) return;
    await axiosInstance.delete(`${endpoint}/${id}/`);
    fetchAll();
  };

  const salvarEdicaoUsuario = async () => {
    if (!editandoUsuario) return;
    const { id, ...data } = editandoUsuario;
    await axiosInstance.put(`usuarios/${editandoUsuario.username}/`, data);
    setEditandoUsuario(null);
    fetchUsuarios();
  };

  const renderTab = () => {
    if (loading) return <p>🔄 Carregando...</p>;

    const renderCards = (list, keyFn, titleFn, actionsFn) => (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => (
          <div
            key={keyFn(item)}
            className="rounded border border-green-300 bg-green-50 dark:bg-gray-800 dark:border-green-600 p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
              {titleFn(item)}
            </h3>
            <div className="mt-2">{actionsFn(item)}</div>
          </div>
        ))}
      </div>
    );

    switch (tab) {
      case "solicitacoes":
        return renderCards(
          solicitacoes,
          (s) => s.id,
          (s) => `${s.nome} ${s.sobrenome} (${s.email})`,
          (s) => (
            <>
              <p>Status: {s.aprovado ? "✅ Aprovado" : "⏳ Pendente"}</p>
              {!s.aprovado && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => aprovarSolicitacao(s.id)} className="bg-green-600 text-white px-3 py-1 rounded">Aprovar</button>
                  <button onClick={() => rejeitarSolicitacao(s.id)} className="bg-red-600 text-white px-3 py-1 rounded">Rejeitar</button>
                </div>
              )}
            </>
          )
        );

      case "usuarios":
        return renderCards(
          usuarios,
          (u) => u.id,
          (u) =>
            editandoUsuario?.id === u.id ? (
              <div className="space-y-2">
                <input type="text" value={editandoUsuario.first_name} onChange={(e) => setEditandoUsuario({ ...editandoUsuario, first_name: e.target.value })} placeholder="Nome" className="w-full text-black px-2 py-1 rounded" />
                <input type="text" value={editandoUsuario.last_name} onChange={(e) => setEditandoUsuario({ ...editandoUsuario, last_name: e.target.value })} placeholder="Sobrenome" className="w-full text-black px-2 py-1 rounded" />
                <input type="email" value={editandoUsuario.email} onChange={(e) => setEditandoUsuario({ ...editandoUsuario, email: e.target.value })} placeholder="E-mail" className="w-full text-black px-2 py-1 rounded" />
                <input type="text" value={editandoUsuario.username} onChange={(e) => setEditandoUsuario({ ...editandoUsuario, username: e.target.value })} placeholder="Usuário" className="w-full text-black px-2 py-1 rounded" />
                <label className="block text-sm text-black dark:text-white">
                  <input type="checkbox" checked={editandoUsuario.is_staff} onChange={(e) => setEditandoUsuario({ ...editandoUsuario, is_staff: e.target.checked })} className="mr-2" />
                  Professor
                </label>
              </div>
            ) : (
              `${u.username} (${u.is_staff ? "Professor" : "Aluno"})`
            ),
          (u) =>
            editandoUsuario?.id === u.id ? (
              <div className="flex gap-2">
                <button onClick={salvarEdicaoUsuario} className="bg-green-600 text-white px-3 py-1 rounded">Salvar</button>
                <button onClick={() => setEditandoUsuario(null)} className="bg-gray-500 text-white px-3 py-1 rounded">Cancelar</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditandoUsuario(u)} className="bg-yellow-600 text-white px-3 py-1 rounded">Editar</button>
                <button onClick={() => deleteItem("usuarios", u.username)} className="bg-red-600 text-white px-3 py-1 rounded">Deletar</button>
              </div>
            )
        );

      case "aulas":
        return renderCards(aulas, (a) => a.id, (a) => a.titulo, (a) => (
          <button onClick={() => deleteItem("aulas", a.id)} className="bg-red-600 text-white px-3 py-1 rounded">Deletar</button>
        ));

      case "atividades":
        return renderCards(atividades, (a) => a.id, (a) => a.titulo, (a) => (
          <button onClick={() => deleteItem("atividades", a.id)} className="bg-red-600 text-white px-3 py-1 rounded">Deletar</button>
        ));

      case "quizzes":
        return renderCards(quizzes, (q) => q.id, (q) => q.title, (q) => (
          <button onClick={() => deleteItem("quizzes", q.id)} className="bg-red-600 text-white px-3 py-1 rounded">Deletar</button>
        ));

      case "desempenhos":
        return renderCards(desempenhos, (d) => d.id, (d) => `${d.titulo} - Nota: ${d.nota}`, () => null);

      default:
        return null;
    }
  };

  const tabs = [
    { id: "solicitacoes", label: "Solicitações" },
    { id: "usuarios", label: "Usuários" },
    { id: "aulas", label: "Aulas" },
    { id: "atividades", label: "Atividades" },
    { id: "quizzes", label: "Quizzes" },
    { id: "desempenhos", label: "Desempenhos" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar isAdmin />
      <main role="main" className="ml-64 flex-1 p-6">
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">
          Painel Administrativo
        </h1>

        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1 rounded ${
                tab === t.id
                  ? "bg-green-600 text-white"
                  : "bg-green-100 dark:bg-gray-800 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {renderTab()}
      </main>
    </div>
  );
}

