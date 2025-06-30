import React, { useEffect, useState } from "react";
import axios from "axios";

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

  // Agrupa notas por nome do aluno
  const notasPorAluno = notas.reduce((acc, nota) => {
    const nome = nota.aluno_nome || "Sem nome";
    if (!acc[nome]) acc[nome] = [];
    acc[nome].push(nota);
    return acc;
  }, {});

  return (
    <div className="p-6 ml-64 text-black">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        {editandoId ? "Editar Nota" : "Postar Desempenho"}
      </h1>

      <input
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <textarea
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="number"
        placeholder="Nota"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <select
        value={aluno}
        onChange={(e) => setAluno(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="">Selecione o aluno</option>
        {alunos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.username}
          </option>
        ))}
      </select>

      <div className="flex gap-2 mb-6">
        <button
          onClick={salvarNota}
          className="bg-green-600 text-white py-2 px-6 rounded"
        >
          {editandoId ? "Salvar Alterações" : "Salvar Nota"}
        </button>
        {editandoId && (
          <button
            onClick={resetForm}
            className="bg-gray-400 text-white py-2 px-4 rounded"
          >
            Cancelar
          </button>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">Notas lançadas por aluno</h2>

      {Object.entries(notasPorAluno).map(([alunoNome, notasAluno]) => (
        <div key={alunoNome} className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{alunoNome}</h3>
          {notasAluno.map((n) => (
            <div
              key={n.id}
              className="border p-3 rounded mb-2 flex justify-between items-center bg-white"
            >
              <div>
                <strong>{n.titulo}</strong>: {n.nota}
                <p className="text-sm text-gray-600">{n.descricao}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => iniciarEdicao(n)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => deletarNota(n.id)}
                  className="text-red-600 hover:underline"
                >
                  Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
