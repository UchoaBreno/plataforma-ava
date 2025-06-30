// src/pages/AulasProfessor.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Sidebar from "../components/Sidebar";

// -------------------- Modal de Entregas --------------------
function DeliveriesModal({ student, deliveries, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4">
          Entregas de {student.nome}
        </h2>
        {deliveries.length === 0 ? (
          <p className="text-gray-600">Nenhuma entrega encontrada.</p>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto pr-2">
            {deliveries.map((e) => (
              <li key={e.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{e.aula_titulo}</p>
                  <p className="text-xs text-gray-500">
                    Enviado em {dayjs(e.enviado_em).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
                <a
                  href={`http://127.0.0.1:8000${e.arquivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 underline text-sm"
                >
                  Abrir arquivo
                </a>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// -------------------- Página AulasProfessor --------------------
export default function AulasProfessor() {
  const token = localStorage.getItem("access");

  const [alunos, setAlunos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [modalStudent, setModalStudent] = useState(null);

  const fetchEntregas = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/entregas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntregas(data);
    } catch (err) {
      console.error("Erro ao buscar entregas:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      console.warn("Token ausente. Redirecionando para login.");
      window.location.href = "/login";
      return;
    }

    // ALUNOS
    axios
      .get("http://127.0.0.1:8000/api/alunos/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setAlunos(data.map((u) => ({ id: u.id, nome: u.first_name || u.username })));
      })
      .catch((err) => {
        console.error("Erro ao buscar alunos:", err);
        setAlunos([]);
      });

    // ENTREGAS + polling
    fetchEntregas();
    const interval = setInterval(fetchEntregas, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const entregasPorAluno = (alunoId) =>
    entregas.filter((e) => Number(e.aluno) === Number(alunoId));

  return (
    <div className="flex">
      <Sidebar isStaff />

      <main className="ml-64 flex-1 bg-gray-900 text-white p-6 relative">
        <h1 className="mb-6 text-3xl font-bold text-green-600">Minhas Aulas</h1>

        <div className="space-y-3 rounded-xl border border-blue-300 bg-blue-50 p-4 shadow max-w-md mx-auto">
          <h2 className="mb-2 text-lg font-bold">Alunos</h2>
          {alunos.length === 0 ? (
            <p className="text-gray-600">Nenhum aluno encontrado.</p>
          ) : (
            alunos.map((al) => (
              <button
                key={al.id}
                type="button"
                onClick={() => setModalStudent(al)}
                className="w-full flex justify-between items-center rounded border px-3 py-2 bg-white hover:bg-gray-100 transition"
              >
                <p className="truncate font-medium text-green-800">
                  {al.nome}
                </p>
                <span className="text-sm text-gray-600">
                  Entregas: {entregasPorAluno(al.id).length}
                </span>
              </button>
            ))
          )}
        </div>

        {modalStudent && (
          <DeliveriesModal
            student={modalStudent}
            deliveries={entregasPorAluno(modalStudent.id)}
            onClose={() => setModalStudent(null)}
          />
        )}
      </main>
    </div>
  );
}
