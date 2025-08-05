import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import jwtDecode from "jwt-decode";  // Certificando-se de importar jwt-decode corretamente
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function QuizDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [erro, setErro] = useState("");
  const [showContent, setShowContent] = useState(false);

  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);  // Decodificando o JWT corretamente
      const id = decoded.user_id ?? decoded.id;
      if (id) setAlunoId(id);
    } catch {
      console.error("Token inválido.");
    }
  }, [token]);

  useEffect(() => {
    if (!token || !alunoId) return;
    carregarQuiz();
  }, [token, alunoId]);

  async function carregarQuiz() {
    try {
      const quizRes = await axiosInstance.get(`quizzes/${id}/`);
      setQuiz(quizRes.data);
    } catch (err) {
      console.error("Erro ao carregar quiz:", err.response?.data || err);
      alert("Erro ao carregar o quiz.");
      navigate("/quizzes");
    }
  }

  const handleVisualizarConteudo = () => {
    setShowContent(true);
    window.open(`${process.env.REACT_APP_API_URL}${quiz.pdf}`, "_blank"); 
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-6">
        {!quiz ? (
          <p>Carregando quiz...</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
            <p className="mb-4">{quiz.description}</p>

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

            {erro && (
              <div className="text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600 px-4 py-2 rounded text-center mb-4 text-sm">
                {erro}
              </div>
            )}

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
          </>
        )}
      </main>
    </div>
  );
}
