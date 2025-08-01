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

      <main className="ml-64 flex-1 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">
            Minhas Notas
          </h1>
        </div>

        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">
            Carregando notas...
          </p>
        ) : notas.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            Nenhuma nota registrada ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notas.map((n) => (
              <div
                key={n.id}
                className="flex flex-col justify-between rounded border border-green-300 bg-white dark:bg-gray-800 dark:border-green-600 p-4 shadow hover:shadow-md transition"
              >
                <p className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">
                  {n.titulo}
                </p>
                {n.descricao && (
                  <p className="text-sm text-gray-700 dark:text-gray-400 mb-2 line-clamp-2">
                    {n.descricao}
                  </p>
                )}
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
