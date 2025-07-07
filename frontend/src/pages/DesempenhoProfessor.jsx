import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function DesempenhoProfessor() {
  const [notas, setNotas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nota, setNota] = useState("");
  const [aluno, setAluno] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchNotas();
    fetchAlunos();
  }, []);

  const fetchNotas = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/desempenhos/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotas(res.data);
  };

  const fetchAlunos = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/alunos/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAlunos(res.data);
  };

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setNota("");
    setAluno("");
    setEditandoId(null);
  };

  const salvarNota = async () => {
    const payload = { titulo, descricao, nota, aluno };

    if (editandoId) {
      await axios.put(
        `http://127.0.0.1:8000/api/desempenhos/${editandoId}/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post("http://127.0.0.1:8000/api/desempenhos/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    resetForm();
    fetchNotas();
  };

  const iniciarEdicao = (nota) => {
    setEditandoId(nota.id);
    setTitulo(nota.titulo);
    setDescricao(nota.descricao);
    setNota(nota.nota);
    setAluno(nota.aluno);
  };

  const deletarNota = async (id) => {
    await axios.delete(`http://127.0.0.1:8000/api/desempenhos/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotas();
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
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
          {editandoId ? "Editar Nota" : "Postar Desempenho"}
        </h1>

        <div className="max-w-lg space-y-3 mb-6">
          <input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
          />
          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
          />
          <input
            type="number"
            placeholder="Nota"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
          />
          <select
            value={aluno}
            onChange={(e) => setAluno(e.target.value)}
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

        {Object.entries(notasPorAluno).map(([alunoNome, notasAluno]) => (
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
                  <span className="text-green-700 dark:text-green-400">{n.nota}</span>
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
        ))}
      </main>
    </div>
  );
}
