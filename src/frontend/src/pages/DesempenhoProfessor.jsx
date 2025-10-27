import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function DesempenhoProfessor() {
  const [notas, setNotas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    nota: "",
    aluno: "",
  });

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const [notasRes, alunosRes] = await Promise.all([
        axiosInstance.get("desempenhos/"),
        axiosInstance.get("alunos/"),
      ]);
      setNotas(notasRes.data);
      setAlunos(alunosRes.data);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ titulo: "", descricao: "", nota: "", aluno: "" });
    setEditandoId(null);
  };

  const salvarNota = async () => {
    const payload = { ...form };

    try {
      if (editandoId) {
        await axiosInstance.put(`desempenhos/${editandoId}/`, payload);
      } else {
        await axiosInstance.post("desempenhos/", payload);
      }
      resetForm();
      fetchDados();
    } catch (err) {
      console.error("Erro ao salvar nota:", err);
    }
  };

  const iniciarEdicao = (nota) => {
    setEditandoId(nota.id);
    setForm({
      titulo: nota.titulo,
      descricao: nota.descricao,
      nota: nota.nota,
      aluno: nota.aluno,
    });
  };

  const deletarNota = async (id) => {
    if (!window.confirm("Confirma a exclusão desta nota?")) return;
    try {
      await axiosInstance.delete(`desempenhos/${id}/`);
      fetchDados();
    } catch (err) {
      console.error("Erro ao deletar nota:", err);
    }
  };

  const notasPorAluno = notas.reduce((acc, nota) => {
    const nome = nota.aluno_nome || "Sem nome";
    if (!acc[nome]) acc[nome] = [];
    acc[nome].push(nota);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isStaff />

      <main className="ml-64 flex-1 p-6">
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">
          {editandoId ? "Editar Nota" : "Postar Desempenho"}
        </h1>

        <div className="max-w-lg space-y-3 mb-8">
          <input
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
          />
          <textarea
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
          />
          <input
            type="number"
            placeholder="Nota"
            value={form.nota}
            onChange={(e) => setForm({ ...form, nota: e.target.value })}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
          />
          <select
            value={form.aluno}
            onChange={(e) => setForm({ ...form, aluno: e.target.value })}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
          >
            <option value="">Selecione o aluno</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.username}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={salvarNota}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
            >
              {editandoId ? "Salvar Alterações" : "Salvar Nota"}
            </button>
            {editandoId && (
              <button
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Notas lançadas por aluno</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          Object.entries(notasPorAluno).map(([alunoNome, notasAluno]) => (
            <div key={alunoNome} className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                {alunoNome}
              </h3>
              {notasAluno.map((n) => (
                <div
                  key={n.id}
                  className="border border-gray-300 dark:border-gray-700 p-3 rounded mb-2 flex justify-between items-center bg-white dark:bg-gray-800 text-black dark:text-gray-100"
                >
                  <div>
                    <strong>{n.titulo}</strong>:{" "}
                    <span className="text-green-700 dark:text-green-400">
                      {n.nota}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{n.descricao}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => iniciarEdicao(n)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deletarNota(n.id)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      Apagar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
