import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function DesempenhoAluno() {
  const [notas, setNotas] = useState([]);
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/desempenhos/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotas(res.data);
      } catch (error) {
        console.error("Erro ao buscar desempenho do aluno:", error);
      }
    };

    fetchNotas();
  }, [token]);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-6">
        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
          Minhas Notas
        </h1>
        {notas.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            Nenhuma nota registrada ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {notas.map((n) => (
              <div
                key={n.id}
                className="border-b border-gray-300 dark:border-gray-700 pb-2"
              >
                <p className="font-semibold">
                  {n.titulo}:{" "}
                  <span className="text-green-700 dark:text-green-400">
                    {n.nota}
                  </span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {n.descricao}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
