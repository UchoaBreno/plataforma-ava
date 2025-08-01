import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

const LIMITE_MEDIA = 7;
const LIMITE_BAIXA = 31;

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [alunoId, setAlunoId] = useState(null);
  const [alta, setAlta] = useState([]);
  const [media, setMedia] = useState([]);
  const [baixa, setBaixa] = useState([]);

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
    const intervalo = setInterval(carregarPrioridades, 60 * 60 * 1000);
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

      aulas
        .filter(a => !minhasEntregasIds.has(Number(a.id)))
        .forEach(a => {
          const limite = a.data;
          if (!limite) return;
          const diff = dayjs(limite).startOf("day").diff(hoje, "day");
          if (diff <= 0) _alta.push(a);
          else if (diff <= LIMITE_MEDIA) _media.push(a);
          else if (diff <= LIMITE_BAIXA) _baixa.push(a);
        });

      setAlta(_alta);
      setMedia(_media);
      setBaixa(_baixa);
    } catch (err) {
      console.error("Erro ao carregar aulas:", err.response?.data || err);
    }
  }

  const renderLista = (lista) => (
    <div className="space-y-4">
      {lista.map((a) => (
        <div
          key={a.id}
          className="cursor-pointer rounded border border-green-300 bg-white dark:bg-gray-800 p-4 shadow hover:bg-green-100 dark:hover:bg-gray-700"
          onClick={() => navigate("/aulas")}
        >
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">{a.titulo}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{a.descricao}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            📅 {a.data ? dayjs(a.data).format("DD/MM/YYYY") : ""}
          </p>
          <div className="mt-2">
            {a.arquivo && (
              <img
                src={a.arquivo}
                alt={a.titulo}
                className="h-20 w-full object-cover rounded-lg"
              />
            )}
            {a.video_url && (
              <video
                controls
                className="h-20 w-full object-cover rounded-lg"
                src={a.video_url}
              >
                Seu navegador não suporta vídeos.
              </video>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const CardPrioridade = ({ titulo, lista, borda }) => (
    <div
      className={`rounded border ${borda} bg-white dark:bg-gray-800 p-4 shadow cursor-pointer`}
      onClick={() => navigate("/aulas")}
    >
      <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
        {titulo}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">{lista.length} aula(s)</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400 mb-6">
          Página Inicial
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <CardPrioridade
            titulo="Alta prioridade (vence hoje)"
            borda="border-red-300"
            lista={alta}
          />
          <CardPrioridade
            titulo="Média prioridade (próx. 7 dias)"
            borda="border-yellow-300"
            lista={media}
          />
          <CardPrioridade
            titulo="Baixa prioridade (até 31 dias)"
            borda="border-blue-300"
            lista={baixa}
          />
        </div>

        <h2 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-3">
          Aulas Recentes
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...alta, ...media, ...baixa]
            .filter((a) => a && a.id)
            .slice(0, 6)
            .map((a) => (
              <div
                key={a.id}
                className="cursor-pointer rounded border border-green-300 bg-white dark:bg-gray-800 p-3 shadow hover:bg-green-100 dark:hover:bg-gray-700"
                onClick={() => navigate("/aulas")}
              >
                <h3 className="font-semibold text-green-700 dark:text-green-400">{a.titulo}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{a.descricao}</p>
                <div className="mt-2">
                  {a.arquivo && (
                    <img
                      src={a.arquivo}
                      alt={a.titulo}
                      className="h-20 w-full object-cover rounded-lg"
                    />
                  )}
                  {a.video_url && (
                    <video
                      controls
                      className="h-20 w-full object-cover rounded-lg"
                      src={a.video_url}
                    >
                      Seu navegador não suporta vídeos.
                    </video>
                  )}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
