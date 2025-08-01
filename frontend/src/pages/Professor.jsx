import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";
import GerenciarAulasModal from "../components/GerenciarAulasModal";
import VideoCard from "../components/VideoCard";

export default function Professor() {
  const [aulas, setAulas] = useState([]);
  const [showGerenciar, setShowGerenciar] = useState(false);

  const navigate = useNavigate();

  const carregarAulas = () => {
    axiosInstance
      .get("aulas/")
      .then((r) => setAulas(r.data))
      .catch(console.error);
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");
    carregarAulas();
  }, [navigate]);

  const editar = () =>
    alert("Clique em 'Gerenciar Aulas' e use a aba LISTAR para editar.");

  const apagar = async (id) => {
    if (!window.confirm("Apagar esta aula?")) return;
    await axiosInstance.delete(`aulas/${id}/`);
    carregarAulas();
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar isStaff />

      <main className="ml-64 flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-green-600 dark:text-green-400">
          Painel do Professor
        </h1>

        <div
          onClick={() => setShowGerenciar(true)}
          className="mb-6 cursor-pointer rounded-xl border border-green-200 dark:border-green-600 bg-white dark:bg-gray-800 p-6 text-center shadow hover:bg-green-50 dark:hover:bg-gray-700 transition"
        >
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-400">
            Gerenciar Aulas
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Clique para ver, editar ou publicar aulas / atividades.
          </p>
        </div>

        <h2 className="mb-3 text-xl font-bold text-green-600 dark:text-green-400">
          Minhas aulas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aulas.slice(0, 3).map((a) => (
            <div
              key={a.id}
              className="cursor-pointer rounded-lg border border-green-300 bg-white dark:bg-gray-800 p-4 shadow hover:bg-green-100 dark:hover:bg-gray-700"
            >
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">{a.titulo}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{a.descricao}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📅 {a.data ? dayjs(a.data).format("DD/MM/YYYY") : ""}
              </p>
              <div className="mt-2">
                {/* Se o conteúdo for um slide (PDF ou Imagem) */}
                {a.arquivo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Aqui verificamos se é um PDF ou imagem e mostramos de acordo */}
                    {a.arquivo.endsWith(".pdf") ? (
                      <span className="text-white">📄(PDF)</span>
                    ) : (
                      <img
                        src={a.arquivo}
                        alt={a.titulo}
                        className="object-cover h-24 w-full rounded-lg"
                      />
                    )}
                  </div>
                )}
                {/* Se o conteúdo for um vídeo */}
                {a.video_url && (
                  <video
                    controls
                    className="h-24 w-full object-cover rounded-lg"
                    src={a.video_url}
                  >
                    Seu navegador não suporta vídeos.
                  </video>
                )}
                {/* Placeholder caso não haja vídeo ou slide */}
                {!a.arquivo && !a.video_url && (
                  <div className="h-24 w-full bg-gray-300 rounded-lg flex items-center justify-center text-white">
                    Sem conteúdo
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <GerenciarAulasModal
          isOpen={showGerenciar}
          onClose={() => {
            setShowGerenciar(false);
            carregarAulas();
          }}
          requiredFieldsFeedback // <-- habilita validação no modal
        />
      </main>
    </div>
  );
}
