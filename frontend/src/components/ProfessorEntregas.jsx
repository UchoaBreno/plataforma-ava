// src/pages/ProfessorEntregas.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Sidebar from "../components/Sidebar";

export default function ProfessorEntregas() {
  const token = localStorage.getItem("access");

  const [students, setStudents] = useState([]);          // lista de alunos
  const [entregas, setEntregas] = useState([]);          // todas as entregas
  const [selectedStudent, setSelectedStudent] = useState(null); // aluno do modal

  // busca alunos
  const fetchStudents = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/alunos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(data.map(u => ({ id: u.id, name: u.first_name || u.username })));
    } catch {
      const { data } = await axios.get("http://127.0.0.1:8000/api/usuarios/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(
        data
          .filter(u => !u.is_staff)
          .map(u => ({ id: u.id, name: u.first_name || u.username }))
      );
    }
  };

  // busca entregas e retorna o array (para uso em openModal)
  const fetchEntregas = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/entregas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntregas(data);
      return data;
    } catch {
      return [];
    }
  };

  // retorna só as entregas de um aluno
  const entregasForStudent = studentId =>
    entregas.filter(e => Number(e.aluno) === Number(studentId));

  // abre modal: primeiro re-fetch de entregas para garantir lista atual
  const openModalForStudent = student => {
    fetchEntregas().then(() => {
      setSelectedStudent(student);
    });
  };

  // fecha o modal
  const closeModal = () => setSelectedStudent(null);

  // monta polling e carga inicial
  useEffect(() => {
    if (!token) return;
    fetchStudents();
    fetchEntregas();
    const intervalo = setInterval(fetchEntregas, 5 * 1000); // agora 5s
    return () => clearInterval(intervalo);
  }, [token]);

  return (
    <div className="flex">
      <Sidebar isStaff />

      <main className="ml-64 flex-1 bg-gray-50 p-6 text-black">
        <h1 className="text-3xl font-bold mb-6">Entregas dos Alunos</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => {
            const count = entregasForStudent(student.id).length;
            return (
              <button
                key={student.id}
                onClick={() => openModalForStudent(student)}
                className="flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl shadow p-4 hover:bg-primary/10 transition cursor-pointer"
              >
                <div>
                  <p className="font-medium text-green-800">{student.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Entregas: {count}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white bg-gray-300 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enviado em{" "}
                      {dayjs(sub.enviado_em).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                  <a
                    href={
                      sub.arquivo.startsWith("http")
                        ? sub.arquivo
                        : `http://127.0.0.1:8000${sub.arquivo}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline text-sm"
                  >
                    Abrir arquivo
                  </a>
                </li>
              ))}
            </ul>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
