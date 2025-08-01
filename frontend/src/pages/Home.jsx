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
  const [alunoNome, setAlunoNome] = useState("");  // Para armazenar o nome do aluno
  const [alta, setAlta] = useState([]);
  const [media, setMedia] = useState([]);
  const [baixa, setBaixa] = useState([]);
  const [statusNotificacao, setStatusNotificacao] = useState(""); // Status de notificação
  const [metrics, setMetrics] = useState({
    totalAulas: 0,
    aulasPendentes: 0,
    aulasConcluidas: 0,
  });

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const id = decoded.user_id ?? decoded.id;
      const nome = decoded.first_name || decoded.username;  // Captura o nome do aluno
      if (id) {
        setAlunoId(id);
        setAlunoNome(nome);  // Salva o nome do aluno
      }
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
      const _alta = [], _media = [], _baixa = [];
      let aulasConcluidas = 0;
      let aulasPendentes = 0;

      aulas.forEach(a => {
        const limite = a.data;
        if (!limite) return;
        const diff = dayjs(limite).startOf("day").diff(hoje, "day");

        // Aulas em alta prioridade (vence hoje)
        if (diff <= 0) {
          _alta.push(a);
          aulasPendentes++;
        }
        // Aulas em média prioridade (próximos 7 dias)
        else if (diff <= LIMITE_MEDIA) {
          _media.push(a);
          aulasPendentes++;
        }
        // Aulas em baixa prioridade (até 31 dias)
        else if (diff <= LIMITE_BAIXA) {
          _baixa.push(a);
          aulasPendentes++;
        }

        // Verifica se a aula já foi entregue
        if (minhasEntregasIds.has(Number(a.id))) {
          aulasConcluidas++;
        }
      });

      setAlta(_alta);
      setMedia(_media);
      setBaixa(_baixa);
      setMetrics({
        totalAulas: aulas.length,
        aulasPendentes,
        aulasConcluidas,
      });

      // Verifica a notificação caso uma aula esteja vencendo
      if (_alta.length > 0) {
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
          Bem-vindo à sua tela inicial, {alunoNome}!
        </h1>

        {/* Notificação de Aula em Alta Prioridade */}
        {statusNotificacao && (
          <div className="bg-red-300 text-white p-3 rounded-lg mb-4">
            {statusNotificacao}
          </div>
        )}

        {/* Exibindo as métricas */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-3">
            Resumo da sua atividade
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Você tem <span className="font-semibold">{metrics.aulasPendentes}</span> aulas pendentes de <span className="font-semibold">{metrics.totalAulas}</span>.
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
             Aulas concluídas: <span className="font-semibold">{metrics.aulasConcluidas}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
