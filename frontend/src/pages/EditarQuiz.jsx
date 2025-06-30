import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditarQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!token) {
      alert("Faça login primeiro.");
      navigate("/login");
      return;
    }

    axios
      .get(`http://127.0.0.1:8000/api/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setTitle(data.title || "");
        setDescription(data.description || "");
      })
      .catch((err) => {
        alert("Erro ao carregar quiz");
        console.error(err);
      });
  }, [id, token, navigate]);

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/quizzes/${id}/`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Quiz atualizado!");
      navigate("/quizzes");
    } catch (err) {
      alert("Erro ao atualizar quiz");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Quiz excluído com sucesso!");
      navigate("/quizzes");
    } catch (err) {
      alert("Erro ao excluir quiz");
      console.error(err);
    }
  };

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      <h1 className="text-2xl mb-6 text-green-500 font-bold">Editar Quiz</h1>

      <label className="block mb-2">Título</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block w-full p-2 mb-4 text-black rounded border border-gray-300"
      />

      <label className="block mb-2">Descrição</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="block w-full p-2 mb-6 text-black rounded border border-gray-300"
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
    </div>
  );
}
