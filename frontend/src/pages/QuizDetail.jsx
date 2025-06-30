// src/pages/QuizDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function QuizDetail() {
  const { id } = useParams();
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`http://127.0.0.1:8000/api/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setQuiz(data))
      .catch(console.error);
  }, [id, token]);

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

      const { data } = await axios.post(
        "http://127.0.0.1:8000/api/respostas/",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(data);
    } catch (err) {
      console.error("Erro ao enviar respostas:", err);
      alert("Erro ao enviar respostas");
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz) {
    return (
      <div className="flex">
        <Sidebar isAluno />
        <main className="ml-64 flex-1 p-6">Carregando quiz…</main>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex">
        <Sidebar isAluno />
        <main className="ml-64 flex-1 p-6">
          <h1 className="text-3xl font-bold mb-4">Resultado</h1>
          <p className="text-xl">
            Você acertou {result.score} de {quiz.questions.length} perguntas.
          </p>
          <button
            onClick={() => navigate("/quizzes")}
            className="mt-6 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Voltar aos quizzes
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="p-4 border rounded">
              <p className="font-medium mb-2">
                {index + 1}. {question.text}
              </p>
              <div className="space-y-2">
                {question.choices.map((choice) => (
                  <label key={choice.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={choice.id}
                      checked={answers[question.id] === choice.id}
                      onChange={() => handleChoice(question.id, choice.id)}
                      required
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
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Enviar respostas"}
          </button>
        </form>
      </main>
    </div>
  );
}
