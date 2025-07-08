import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

// -------------------- Modal de Entregas --------------------
function DeliveriesModal({ student, deliveries, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 text-black dark:text-gray-100 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4">
          Entregas de {student.nome}
        </h2>
        {deliveries.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            Nenhuma entrega encontrada.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto pr-2">
            {deliveries.map((e) => (
              <li key={e.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{e.aula_titulo}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enviado em{" "}
                    {dayjs(e.data_envio).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
                <a
                  href={e.arquivo.startsWith("http") ? e.arquivo : `https://plataforma-ava2.onrender.com${e.arquivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400 underline text-sm"
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
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// -------------------- Página AulasProfessor --------------------
export default function AulasProfessor() {
  const [alunos, setAlunos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [modalStudent, setModalStudent] = useState(null);

  const fetchEntregas = async () => {
    try {
      const { data } = await axiosInstance.get("entregas/");
      setEntregas(data);
    } catch (err) {
      console.error("Erro ao buscar entregas:", err);
    }
  };

  useEffect(() => {
    axiosInstance
      .get("alunos/")
      .then(({ data }) => {
        setAlunos(
          data.map((u) => ({ id: u.id, nome: u.first_name || u.username }))
        );
      })
      .catch((err) => {
        console.error("Erro ao buscar alunos:", err);
        setAlunos([]);
      });

    fetchEntregas();
    const interval = setInterval(fetchEntregas, 5000);
    return () => clearInterval(interval);
  }, []);

  const entregasPorAluno = (alunoId) =>
    entregas.filter((e) => Number(e.aluno) === Number(alunoId));

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isStaff />

      <main className="ml-64 flex-1 p-6 relative">
        <h1 className="mb-6 text-3xl font-bold text-green-600 dark:text-green-400">
          Entregas dos Alunos
        </h1>

        <div className="space-y-3 rounded-xl border border-green-300 dark:border-green-600 bg-green-50 dark:bg-gray-800 p-4 shadow max-w-md mx-auto">
          <h2 className="mb-2 text-lg font-bold">Alunos</h2>
          {alunos.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              Nenhum aluno encontrado.
            </p>
          ) : (
            alunos.map((al) => (
              <button
                key={al.id}
                type="button"
                onClick={() => setModalStudent(al)}
                className="w-full flex justify-between items-center rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <p className="truncate font-medium text-green-800 dark:text-green-400">
                  {al.nome}
                </p>
                <span className="text-sm text-gray-600 dark:text-gray-300">
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
