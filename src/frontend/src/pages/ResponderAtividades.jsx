import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

export default function ResponderAtividades() {
  const navigate = useNavigate();
  const [atividades, setAtividades] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const token = localStorage.getItem("access");

  const fetchAtividades = async () => {
    try {
      setErro("");
      const { data } = await axiosInstance.get("atividades-aluno/");
      setAtividades(data);
    } catch (err) {
      console.error("Erro ao buscar atividades:", err);
      setErro("❌ Não foi possível carregar as atividades.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      jwtDecode(token); // só para verificar validade
    } catch (err) {
      localStorage.removeItem("access");
      navigate("/login");
      return;
    }

    fetchAtividades();
    const intervalId = setInterval(fetchAtividades, 15000);
    return () => clearInterval(intervalId);
  }, [token, navigate]);

  const handleResponder = (id) => navigate(`/atividades/${id}/responder`);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isAluno isStaff={false} />
      <main className="ml-64 flex-1 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">
            Atividades Recebidas
          </h1>
        </div>

        {erro && (
          <div className="text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600 px-4 py-2 rounded text-center mb-4 text-sm">
            {erro}
          </div>
        )}

        {carregando ? (
          <p className="text-gray-600 dark:text-gray-400">
            Carregando atividades...
          </p>
        ) : atividades.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Nenhuma atividade disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {atividades.map((atividade) => (
              <div
                key={atividade.id}
                onClick={() => handleResponder(atividade.id)}
                className="flex flex-col justify-between rounded border border-green-300 bg-white dark:bg-gray-800 dark:border-green-600 p-4 shadow hover:shadow-md transition cursor-pointer"
              >
                <div>
                  <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
                    {atividade.titulo}
                  </h2>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Prazo: {dayjs(atividade.data_entrega).format("DD/MM/YYYY")}{" "}
                    {atividade.hora_entrega && <>às {atividade.hora_entrega}</>}
                  </p>
                  {atividade.descricao && (
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-400 line-clamp-2">
                      {atividade.descricao}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
