import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";

export default function Home() {
  const [username, setUsername] = useState("Usuário");
  const [cargo, setCargo] = useState("Aluno");
  const [alunoId, setAlunoId] = useState(null);

  const [alta, setAlta] = useState([]);
  const [media, setMedia] = useState([]);
  const [baixa, setBaixa] = useState([]);

  const [modalAberto, setModalAberto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    const user = localStorage.getItem("username");

    if (token) {
      try {
        const d = jwtDecode(token);
        setUsername(d.username || user || "Usuário");
        setCargo(d.is_staff ? "Professor" : "Aluno");
        setAlunoId(d.user_id ?? d.id ?? null);
      } catch {
        setUsername(user || "Usuário");
      }
    } else {
      setUsername(user || "Usuário");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token || !alunoId) return;

    async function fetchData() {
      try {
        const [aulasRes, entregasRes] = await Promise.all([
          axios.get("/api/aulas-aluno/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/entregas/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const aulas = Array.isArray(aulasRes.data) ? aulasRes.data : [];
        const entregas = Array.isArray(entregasRes.data) ? entregasRes.data : [];

        const entreguesIds = new Set(
          entregas
            .filter(e => Number(e.aluno) === Number(alunoId))
            .map(e => Number(e.aula))
        );

        const hoje = dayjs().startOf("day");
        const _alta = [], _media = [], _baixa = [];

        aulas
          .filter(a => !entreguesIds.has(Number(a.id)))
          .forEach(a => {
            const limite = a.data;
            if (!limite) return;
            const diff = dayjs(limite).startOf("day").diff(hoje, "day");
            if (diff <= 0) _alta.push(a);
            else if (diff <= 7) _media.push(a);
            else if (diff <= 31) _baixa.push(a);
          });

        setAlta(_alta);
        setMedia(_media);
        setBaixa(_baixa);
      } catch (err) {
        console.error("Erro ao carregar Home:", err);
      }
    }

    fetchData();
  }, [alunoId]);

  const renderLista = lista => (
    <div className="space-y-4">
      {lista.map(a => (
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
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar isAluno />

      <main className="ml-64 flex-1 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
          Página Inicial
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {[{ key: "alta", label: "Alta Prioridade", lista: alta },
            { key: "media", label: "Média Prioridade", lista: media },
            { key: "baixa", label: "Baixa Prioridade", lista: baixa },
          ].map(({ key, label, lista }) => (
            <button
              key={key}
              onClick={() => setModalAberto(key)}
              className="rounded-lg border border-green-300 bg-white dark:bg-gray-800 p-4 text-left shadow hover:shadow-md"
            >
              <h2 className="text-lg font-bold text-green-700 dark:text-green-400">
                {label}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {lista.length} aula(s)
              </p>
            </button>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-3">
          Aulas Recentes
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...alta, ...media, ...baixa].slice(0, 6).map(a => (
            <div
              key={a.id}
              className="cursor-pointer rounded border border-green-300 bg-white dark:bg-gray-800 p-3 shadow hover:bg-green-100 dark:hover:bg-gray-700"
              onClick={() => navigate("/aulas")}
            >
              <h3 className="font-semibold text-green-700 dark:text-green-400">{a.titulo}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{a.descricao}</p>
            </div>
          ))}
        </div>

        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
            <div className="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg">
              <button
                onClick={() => setModalAberto(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black dark:hover:text-white"
              >
                ✖
              </button>
              <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-3">
                {modalAberto === "alta" && "Alta Prioridade"}
                {modalAberto === "media" && "Média Prioridade"}
                {modalAberto === "baixa" && "Baixa Prioridade"}
              </h2>
              {modalAberto === "alta" && renderLista(alta)}
              {modalAberto === "media" && renderLista(media)}
              {modalAberto === "baixa" && renderLista(baixa)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
