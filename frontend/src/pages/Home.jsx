import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import axios from "axios";

import Sidebar from "../components/Sidebar";

export default function Home() {
  const [username, setUsername] = useState("Usuário");
  const [cargo, setCargo] = useState("Aluno");
  const [alunoId, setAlunoId] = useState(null);

  const [aulasHoje, setAulasHoje] = useState([]);
  const [aulasSemana, setAulasSemana] = useState([]);
  const [aulasMes, setAulasMes] = useState([]);

  const [modalAberto, setModalAberto] = useState(null);

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
          axios.get("/api/aulas/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/entregas/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const listaAulas = Array.isArray(aulasRes.data) ? aulasRes.data : [];
        const listaEntregas = Array.isArray(entregasRes.data) ? entregasRes.data : [];

        const entreguesIds = new Set(
          listaEntregas
            .filter(e => Number(e.aluno) === Number(alunoId))
            .map(e => Number(e.aula))
        );

        const hoje = dayjs();
        const hj = listaAulas.filter(a =>
          dayjs(a.data_postagem).isSame(hoje, "day") &&
          !entreguesIds.has(Number(a.id))
        );
        const sem = listaAulas.filter(a =>
          dayjs(a.data_postagem).isSame(hoje, "week") &&
          !hj.find(x => x.id === a.id) &&
          !entreguesIds.has(Number(a.id))
        );
        const mes = listaAulas.filter(a =>
          dayjs(a.data_postagem).isSame(hoje, "month") &&
          !hj.find(x => x.id === a.id) &&
          !sem.find(x => x.id === a.id) &&
          !entreguesIds.has(Number(a.id))
        );

        setAulasHoje(hj);
        setAulasSemana(sem);
        setAulasMes(mes);
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
          className="rounded border border-green-300 bg-white dark:bg-gray-800 p-4 shadow"
        >
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">{a.titulo}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{a.descricao}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            📅 {a.data_postagem ? dayjs(a.data_postagem).format("DD/MM/YYYY") : ""}
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
          {[
            { key: "hoje", label: "Aulas de Hoje", lista: aulasHoje },
            { key: "semana", label: "Aulas da Semana", lista: aulasSemana },
            { key: "mes", label: "Aulas do Mês", lista: aulasMes },
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
          {(aulasSemana.length ? aulasSemana : aulasMes).map(a => (
            <div
              key={a.id}
              className="rounded border border-green-300 bg-white dark:bg-gray-800 p-3 shadow"
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
                {modalAberto === "hoje" && "Aulas de Hoje"}
                {modalAberto === "semana" && "Aulas da Semana"}
                {modalAberto === "mes" && "Aulas do Mês"}
              </h2>
              {modalAberto === "hoje" && renderLista(aulasHoje)}
              {modalAberto === "semana" && renderLista(aulasSemana)}
              {modalAberto === "mes" && renderLista(aulasMes)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
