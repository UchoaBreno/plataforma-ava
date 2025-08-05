import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function QuizzesAluno() {
  const token = localStorage.getItem("access");

  const [quizzes, setQuizzes] = useState([]);
  const [showError, setShowError] = useState("");
  const [showContent, setShowContent] = useState(false); // Controla se o conteúdo do quiz (PDF) deve ser mostrado
  const [quizSelecionado, setQuizSelecionado] = useState(null); // Para armazenar o quiz selecionado
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const { data } = await axiosInstance.get("quizzes/");
      setQuizzes(data);
    } catch (err) {
      console.error("Erro ao buscar quizzes:", err);
      setShowError("Não foi possível carregar os quizzes.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
    } catch {
      setShowError("Token inválido.");
    }

    fetchQuizzes();
  }, [token, navigate]);

  const handleStart = (id) => navigate(`/quizzes/${id}`);
  const handleSubmit = async (quizId) => {
    try {
      // Lógica para enviar respostas aqui (se necessário)
      alert("Respostas enviadas com sucesso!");
      setQuizSelecionado(null); // Reseta após o envio
    } catch (err) {
      console.error("Erro ao enviar respostas:", err);
      setShowError("Erro ao enviar respostas.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-6">
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">
          Quizzes Disponíveis
        </h1>

        {showError && (
          <div className="text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600 px-4 py-2 rounded text-center mb-4 text-sm">
            {showError}
          </div>
        )}

        {quizzes.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            Nenhum quiz disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="flex flex-col justify-between rounded border border-green-300 bg-white dark:bg-gray-800 dark:border-gray-600 p-4 shadow hover:shadow-md transition"
              >
                <div
                  onClick={() => setQuizSelecionado(q)} // Define o quiz selecionado ao clicar
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

                {q.pdf && !showContent && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowContent(true)}
                      className="text-green-600 hover:underline"
                    >
                      Visualizar PDF
                    </button>
                  </div>
                )}

                {showContent && q.pdf && (
                  <div className="mb-6 mt-2">
                    <iframe
                      src={`${process.env.REACT_APP_API_URL}${q.pdf}`} // Certifique-se que a URL está correta
                      width="100%"
                      height="500px"
                      title="Visualizar PDF"
                    />
                  </div>
                )}

                {quizSelecionado?.id === q.id && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleSubmit(q.id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
                    >
                      Enviar Respostas
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
