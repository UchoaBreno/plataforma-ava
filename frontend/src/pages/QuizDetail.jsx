import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});  // Respostas do quiz
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [erro, setErro] = useState("");
  const [showContent, setShowContent] = useState(false);

  // Estado para o modal de envio de atividade
  const [selQuiz, setSelQuiz] = useState("");
  const [selArquivo, setSelArquivo] = useState(null);
  const [comentario, setComentario] = useState("");

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

  // Função para enviar o quiz e a atividade
  const enviarQuiz = async (e) => {
    e.preventDefault();
    setErro("");
    setSubmitting(true);

    const perguntasRespondidas = Object.keys(answers).length;
    const totalPerguntas = quiz.questions.length;

    // Verifica se todas as perguntas foram respondidas
    if (perguntasRespondidas < totalPerguntas) {
      setErro("⚠️ Responda todas as perguntas antes de enviar.");
      setSubmitting(false);
      return;
    }

    if (!selArquivo) {
      setErro("⚠️ Você precisa selecionar um arquivo.");
      setSubmitting(false);
      return;
    }

    try {
      // Log dos dados para verificar
      console.log({
        quiz: id,
        respostas: Object.entries(answers).map(([questionId, choiceId]) => ({
          pergunta: questionId,
          alternativa: choiceId,
        })),
        comentario: comentario,
      });

      const formData = new FormData();
      formData.append("quiz", id);
      formData.append("comentario", comentario);
      formData.append("arquivo", selArquivo);

      // Certifique-se de que a aulaId esteja disponível
      const aulaId = quiz.aula_id;  // Ajuste conforme sua estrutura de dados
      formData.append("aula", aulaId);  // Adiciona o ID da aula

      // Verificando o FormData antes de enviar
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Envia as respostas do quiz e o arquivo
      await axiosInstance.post("entregas/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Atividade enviada!");
      setSelQuiz("");
      setSelArquivo(null);
      setComentario("");
    } catch (err) {
      console.error("Erro ao enviar atividade:", err);
      setErro("❌ Ocorreu um erro ao enviar a atividade.");
    } finally {
      setSubmitting(false);
    }
  };

  // Função para abrir o PDF
  const handleVisualizarConteudo = () => {
    setShowContent(true);
    const pdfUrl = quiz.pdf.startsWith("http")
      ? quiz.pdf
      : `${process.env.REACT_APP_API_URL}${quiz.pdf}`;
    window.open(pdfUrl, "_blank");
  };

  // Função para cancelar e voltar para quizzes
  const handleCancel = () => {
    navigate("/quizzes");
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
        <p className="mb-4">{quiz.description}</p>

        {/* Exibição do PDF - Clique para visualizar o conteúdo */}
        {quiz.pdf && !showContent && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              Clique aqui para visualizar o conteúdo:
            </h2>
            <button
              onClick={handleVisualizarConteudo}
              className="text-green-600 hover:underline"
            >
              Visualizar conteúdo
            </button>
          </div>
        )}

        {/* Campo de texto para comentários (descrição) */}
        {showContent && (
          <div className="mb-6">
            <label className="text-sm text-green-700 dark:text-green-400">
              Descrição ou Resposta ao Quiz
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full mt-2 rounded border p-2"
              rows="4"
            ></textarea>
          </div>
        )}

        {erro && (
          <div className="text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600 px-4 py-2 rounded text-center mb-4 text-sm">
            {erro}
          </div>
        )}

        {/* Modal para enviar a atividade */}
        <form onSubmit={enviarQuiz} className="space-y-6">
          <label className="block text-sm mb-1 text-green-700 dark:text-green-400">Quiz</label>
          <select
            value={selQuiz}
            onChange={(e) => setSelQuiz(e.target.value)}
            className="w-full mb-3 rounded border px-2 py-1 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">-- escolha --</option>
            <option value={quiz.id}>{quiz.title}</option>
          </select>

          <label className="block text-sm mb-1 text-green-700 dark:text-green-400">Arquivo</label>
          <input
            type="file"
            onChange={(e) => setSelArquivo(e.target.files[0] || null)}
            className="mb-4 w-full text-xs"
            required
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Enviar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
