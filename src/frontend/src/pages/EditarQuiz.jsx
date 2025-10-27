import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function EditarQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await axiosInstance.get(`quizzes/${id}/`);
        setTitle(data.title || "");
        setDescription(data.description || "");
      } catch (err) {
        alert("Erro ao carregar quiz");
        console.error(err);
        navigate("/quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  const handleUpdate = async () => {
    try {
      await axiosInstance.put(`quizzes/${id}/`, { title, description });
      alert("Quiz atualizado com sucesso!");
      navigate("/quizzes");
    } catch (err) {
      alert("Erro ao atualizar quiz");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este quiz?")) return;

    try {
      await axiosInstance.delete(`quizzes/${id}/`);
      alert("Quiz excluído com sucesso!");
      navigate("/quizzes");
    } catch (err) {
      alert("Erro ao excluir quiz");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isStaff />
      <main className="ml-64 flex-1 p-6 flex justify-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl mb-6 text-green-600 dark:text-green-400 font-bold">
            Editar Quiz
          </h1>

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <>
              <label className="block mb-2">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
              />

              <label className="block mb-2">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full p-2 mb-6 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Salvar Alterações
                </button>

                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Excluir Quiz
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
