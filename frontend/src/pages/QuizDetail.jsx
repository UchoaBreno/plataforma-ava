import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`quizzes/${id}/`)
      .then(({ data }) => setQuiz(data))
      .catch((err) => {
        console.error("Erro ao carregar quiz:", err);
        alert("Não foi possível carregar o quiz.");
        navigate("/quizzes");
      });
  }, [id, navigate]);

  // Lógica de visualização do conteúdo (PDF)
  const handleVisualizarConteudo = () => {
    setShowContent(true);
    window.open(
      `${process.env.REACT_APP_API_URL}${quiz.pdf}`, // Abre o PDF em uma nova aba
      "_blank"
    );
  };

  if (!quiz) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar isAluno />
        <main className="ml-64 flex-1 p-6">Carregando quiz…</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
        <p className="mb-4">{quiz.description}</p>

        {/* Lógica de Exibição do PDF */}
        {quiz.pdf && !showContent && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Clique aqui para visualizar o conteúdo:</h2>
            <button
              onClick={handleVisualizarConteudo}
              className="text-green-600 hover:underline"
            >
              Visualizar conteúdo
            </button>
          </div>
        )}

        {/* Formulário para respostas do quiz */}
        <form className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div
              key={question.id}
              className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            >
              <p className="font-medium mb-2">
                {index + 1}. {question.text}
              </p>
              <div className="space-y-2">
                {question.choices.map((choice) => (
                  <label
                    key={choice.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={choice.id}
                      required
                      className="accent-green-600"
                    />
                    <span>{choice.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Enviar respostas
          </button>
        </form>
      </main>
    </div>
  );
}
