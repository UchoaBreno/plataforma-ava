import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

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

  const handleChoice = (questionId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        quiz: id,
        respostas: Object.entries(answers).map(([questionId, choiceId]) => ({
          pergunta: questionId,
          alternativa: choiceId,
        })),
      };

      const { data } = await axiosInstance.post("respostas/", payload);
      setResult(data);
    } catch (err) {
      console.error("Erro ao enviar respostas:", err);
      alert("Ocorreu um erro ao enviar as respostas.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar isAluno />
        <main className="ml-64 flex-1 p-6">Carregando quiz…</main>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar isAluno />
        <main className="ml-64 flex-1 p-6">
          <h1 className="text-3xl font-bold mb-4">Resultado</h1>
          <p className="text-xl">
            Você acertou{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {result.score}
            </span>{" "}
            de {quiz.questions.length} perguntas.
          </p>
          <button
            onClick={() => navigate("/quizzes")}
            className="mt-6 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Voltar aos quizzes
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                      checked={answers[question.id] === choice.id}
                      onChange={() => handleChoice(question.id, choice.id)}
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
            disabled={submitting}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Enviar respostas"}
          </button>
        </form>
      </main>
    </div>
  );
}
