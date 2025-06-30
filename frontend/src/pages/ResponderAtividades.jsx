// src/pages/ResponderAtividades.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import Sidebar from "../components/Sidebar";

export default function ResponderAtividades() {
  const navigate = useNavigate();
  const [atividades, setAtividades] = useState([]);
  const [isStaff, setIsStaff] = useState(false);

  const token = localStorage.getItem("access");

  const fetchAtividades = async () => {
    if (!token) return;

    try {
      console.log("Token atual:", token);
      const response = await axios.get("http://127.0.0.1:8000/api/atividades-aluno/", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  }
});
console.log("RESPOSTA DA API:", response.data); // <--- ADICIONE
setAtividades(response.data);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setIsStaff(decoded.is_staff === true || decoded.is_staff === "true");
    } catch {
      setIsStaff(false);
    }

    fetchAtividades(); // Carrega inicialmente
    const intervalId = setInterval(fetchAtividades, 15000); // Atualiza a cada 15s

    return () => clearInterval(intervalId);
  }, [token]);

  const handleResponder = (id) => navigate(`/atividades/${id}/responder`);

  return (
    <div className="flex">
      <Sidebar isStaff={false} isAluno={true} />
      <main className="ml-64 flex-1 bg-gray-900 text-white p-6">
        <h1 className="text-green-600 text-3xl font-bold mb-6">Atividades Recebidas</h1>

        {atividades.length === 0 ? (
          <p className="text-gray-400">Nenhuma atividade disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {atividades.map((atividade) => (
              <div
                key={atividade.id}
                onClick={() => handleResponder(atividade.id)}
                className="bg-white text-black rounded p-4 border border-green-300 shadow hover:shadow-md transition cursor-pointer"
              >
                <h2 className="text-xl font-semibold text-green-800">{atividade.titulo}</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Prazo: {dayjs(atividade.data_entrega).format("DD/MM/YYYY")}
                </p>
                <p className="text-sm mt-1">{atividade.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
