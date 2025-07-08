import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function DesempenhoAluno() {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const res = await axiosInstance.get("desempenhos/");
        setNotas(res.data);
      } catch (error) {
        console.error("Erro ao buscar desempenho do aluno:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isAluno />

      <main className="ml-64 flex-1 p-6">
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">
          Minhas Notas
        </h1>

        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">Carregando notas...</p>
        ) : notas.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            Nenhuma nota registrada ainda.
          </p>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {notas.map((n) => (
              <div
                key={n.id}
                className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow border border-gray-300 dark:border-gray-700"
              >
                <p className="text-lg font-semibold text-green-800 dark:text-green-400">
                  {n.titulo}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {n.descricao}
                </p>
                <p className="text-base">
                  Nota:{" "}
                  <span className="font-bold text-green-700 dark:text-green-400">
                    {n.nota}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
