// src/pages/Quizzes.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../components/Sidebar";

export default function Quizzes() {
  const token = localStorage.getItem("access");
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [isStaff, setIsStaff] = useState(false);

  // Função para buscar os quizzes da API
  const fetchQuizzes = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/quizzes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(data);
    } catch (error) {
      console.error("Erro ao buscar quizzes:", error);
    }
  };

  // Verifica token e inicia carregamento e intervalo de atualização
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

    fetchQuizzes(); // Carrega inicialmente

    // Atualiza a lista de quizzes a cada 15 segundos
    const intervalId = setInterval(fetchQuizzes, 15000);
    return () => clearInterval(intervalId);
  }, [token]);

  const handleStart = (id) => navigate(`/quizzes/${id}`);
  const handleCreate = () => navigate("/quizzes/criar");
  const handleEdit = (id) => navigate(`/quizzes/${id}/editar`);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este quiz?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
    } catch (err) {
      console.error("Erro ao deletar quiz:", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar isStaff={isStaff} isAluno={!isStaff} />
      <main className="ml-64 flex-1 bg-gray-900 text-white p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-600">Quizzes Disponíveis</h1>
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
          <p className="text-gray-400">Nenhum quiz disponível.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="flex flex-col justify-between rounded border border-green-300 bg-white p-4 shadow hover:shadow-md transition"
              >
                <div onClick={() => handleStart(q.id)} className="cursor-pointer">
                  <h2 className="text-xl font-semibold text-green-800">{q.title}</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Criado em {dayjs(q.created_at).format("DD/MM/YYYY")}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{q.description}</p>
                </div>

                {isStaff && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleEdit(q.id)}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-white py-1 rounded-md"
                    >
                      <FaEdit className="inline-block mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="flex-1 bg-red-500 hover:bg-red-400 text-white py-1 rounded-md"
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
