import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function Quizzes() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [quizzes, setQuizzes] = useState([]);
  const [isStaff, setIsStaff] = useState(false);

  const fetchQuizzes = async () => {
    try {
      const { data } = await axiosInstance.get("quizzes/");
      setQuizzes(data);
    } catch (err) {
      console.error("Erro ao buscar quizzes:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setIsStaff(decoded.is_staff === true || decoded.is_staff === "true");
    } catch {
      setIsStaff(false);
    }

    fetchQuizzes();

    const intervalId = setInterval(fetchQuizzes, 15000);
    return () => clearInterval(intervalId);
  }, [token, navigate]);

  const handleStart = (id) => navigate(`/quizzes/${id}`);
  const handleCreate = () => navigate("/quizzes/criar");
  const handleEdit = (id) => navigate(`/quizzes/${id}/editar`);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este quiz?")) return;
    try {
      await axiosInstance.delete(`quizzes/${id}/`);
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
    } catch (err) {
      console.error("Erro ao deletar quiz:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isStaff={isStaff} isAluno={!isStaff} />
      <main className="ml-64 flex-1 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
            Quizzes Disponíveis
          </h1>
          {isStaff && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <FaPlus /> Adicionar Quiz
            </button>
          )}
        </div>

        {quizzes.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            Nenhum quiz disponível.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="flex flex-col justify-between rounded border border-green-300 bg-white dark:bg-gray-800 dark:border-gray-600 p-4 shadow hover:shadow-md transition"
              >
                <div
                  onClick={() => handleStart(q.id)}
                  className="cursor-pointer"
                >
                  <h2 className="text-xl font-semibold text-green-800 dark:text-green-300">
                    {q.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Criado em {dayjs(q.created_at).format("DD/MM/YYYY")}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
                    {q.description}
                  </p>
                </div>

                {isStaff && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleEdit(q.id)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white py-1 rounded-md"
                    >
                      <FaEdit className="inline-block mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white py-1 rounded-md"
                    >
                      <FaTrash className="inline-block mr-1" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
