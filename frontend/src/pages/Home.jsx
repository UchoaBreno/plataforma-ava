import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

const LIMITE_MEDIA = 7;  // Aulas que vencem nos próximos 7 dias
const LIMITE_BAIXA = 31;  // Aulas que vencem dentro de 31 dias

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [alunoId, setAlunoId] = useState(null);
  const [proximaAula, setProximaAula] = useState(null);  // Para notificações
  const [statusNotificacao, setStatusNotificacao] = useState(""); // Status de notificação

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const id = decoded.user_id ?? decoded.id;
      if (id) setAlunoId(id);
    } catch {
      console.error("Token inválido.");
    }
  }, [token]);

  useEffect(() => {
    if (!token || !alunoId) return;
    carregarPrioridades();
    const intervalo = setInterval(carregarPrioridades, 60 * 60 * 1000); // Atualiza a cada hora
    return () => clearInterval(intervalo);
  }, [token, alunoId]);

  async function carregarPrioridades() {
    try {
      const [aulasRes, entregasRes] = await Promise.all([
        axiosInstance.get("aulas-aluno/"),
        axiosInstance.get("entregas/"),
      ]);

      const aulas = Array.isArray(aulasRes.data) ? aulasRes.data : [];
      const entregas = Array.isArray(entregasRes.data) ? entregasRes.data : [];

      const minhasEntregasIds = new Set(
        entregas.filter(e => e.aluno === alunoId).map(e => Number(e.aula))
      );

      const hoje = dayjs().startOf("day");
      let proximaAulaVencendo = null;

      aulas.forEach(a => {
        const limite = a.data;
        if (!limite) return;
        const diff = dayjs(limite).startOf("day").diff(hoje, "day");
        
        // Aulas em alta prioridade (vence hoje)
        if (diff <= 0) {
          if (!proximaAulaVencendo) proximaAulaVencendo = a; // Define a primeira aula que vence
        }
      });

      setProximaAula(proximaAulaVencendo);

      // Verifica a notificação caso uma aula esteja vencendo
      if (proximaAulaVencendo && dayjs(proximaAulaVencendo.data).isBefore(dayjs().add(1, "day"))) {
        setStatusNotificacao("Atenção: Aula em alta prioridade vencendo!");
      } else {
        setStatusNotificacao("");
      }
    } catch (err) {
      console.error("Erro ao carregar aulas:", err.response?.data || err);
    }
  }

  return (
    <div className={`flex min-h-screen ${statusNotificacao ? 'bg-red-100' : 'bg-gray-100'} dark:bg-gray-900 text-gray-900 dark:text-white`}>
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400 mb-6">
          Página Inicial
        </h1>

        {/* Notificação de Aula em Alta Prioridade */}
        {statusNotificacao && (
          <div className="bg-red-300 text-white p-3 rounded-lg mb-4">
            {statusNotificacao}
          </div>
        )}
      </main>
    </div>
  );
}
