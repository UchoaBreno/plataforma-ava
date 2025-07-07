import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import GerenciarAulasModal from "../components/GerenciarAulasModal";
import VideoCard from "../components/VideoCard";

export default function Professor() {
  const [aulas, setAulas] = useState([]);
  const [showGerenciar, setShowGerenciar] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const carregarAulas = () =>
    axios
      .get("http://127.0.0.1:8000/api/aulas/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setAulas(r.data))
      .catch(console.error);

  useEffect(() => {
    if (!token) return navigate("/");
    carregarAulas();
  }, [navigate, token]);

  const editar = () =>
    alert("Clique em 'Gerenciar Aulas' e use a aba LISTAR para editar.");

  const apagar = async (id) => {
    if (!window.confirm("Apagar esta aula?")) return;
    await axios.delete(`http://127.0.0.1:8000/api/aulas/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
            <VideoCard
              key={a.id}
              aula={a}
              isProfessor
              onEditar={editar}
              onApagar={apagar}
            />
          ))}
        </div>

        <GerenciarAulasModal
          isOpen={showGerenciar}
          onClose={() => {
            setShowGerenciar(false);
            carregarAulas();
          }}
        />
      </main>
    </div>
  );
}
