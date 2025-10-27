import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function ProfessorEntregas() {
  const [students, setStudents] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      const { data } = await axiosInstance.get("alunos/");
      setStudents(data.map(u => ({ id: u.id, name: u.first_name || u.username })));
    } catch {
      try {
        const { data } = await axiosInstance.get("usuarios/");
        setStudents(
          data
            .filter(u => !u.is_staff)
            .map(u => ({ id: u.id, name: u.first_name || u.username }))
        );
      } catch (err) {
        console.error("Erro ao buscar alunos:", err);
      }
    }
  };

  const fetchEntregas = async () => {
    try {
      const { data } = await axiosInstance.get("entregas/");
      setEntregas(data);
    } catch (err) {
      console.error("Erro ao buscar entregas:", err);
    }
  };

  const entregasForStudent = studentId =>
    entregas.filter(e => Number(e.aluno) === Number(studentId));

  const openModalForStudent = student => {
    fetchEntregas().then(() => setSelectedStudent(student));
  };

  const closeModal = () => setSelectedStudent(null);

  useEffect(() => {
    fetchStudents();
    fetchEntregas();
    const intervalo = setInterval(fetchEntregas, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar isStaff />

      <main className="ml-64 flex-1 p-6">
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">
          Entregas dos Alunos
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => {
            const count = entregasForStudent(student.id).length;
            return (
              <button
                key={student.id}
                onClick={() => openModalForStudent(student)}
                className="flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl shadow p-4 hover:bg-green-50 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                <div>
                  <p className="font-medium text-green-800 dark:text-green-400">
                    {student.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Entregas: {count}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-green-700 dark:text-green-400">
              Entregas de {selectedStudent.name}
            </h2>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto pr-2">
              {entregasForStudent(selectedStudent.id).map(sub => (
                <li
                  key={sub.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{sub.aula_titulo}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Enviado em {dayjs(sub.enviado_em).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                  <a
                    href={
                      sub.arquivo.startsWith("http")
                        ? sub.arquivo
                        : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${sub.arquivo}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 dark:text-green-400 underline text-sm"
                  >
                    Abrir arquivo
                  </a>
                </li>
              ))}
            </ul>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
