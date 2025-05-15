// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import axios from "axios";

import Sidebar   from "../components/Sidebar";
import VideoCard from "../components/VideoCard";

export default function Home() {
  /* ───────── estados ───────── */
  const [username,  setUsername]  = useState("Usuário");
  const [cargo,     setCargo]     = useState("Aluno");
  const [fotoUrl,   setFotoUrl]   = useState("https://i.pravatar.cc/100?img=3");
  const [alunoId,   setAlunoId]   = useState(null);

  const [aulasHoje,   setAulasHoje]   = useState([]);
  const [aulasSemana, setAulasSemana] = useState([]);
  const [aulasMes,    setAulasMes]    = useState([]);

  const [modalAberto, setModalAberto] = useState(null);   // hoje | semana | mes

  /* ───────── carga inicial ───────── */
  useEffect(() => {
    const token = localStorage.getItem("access");
    const user  = localStorage.getItem("username");

    // decodifica token para pegar username, cargo e alunoId
    if (token) {
      try {
        const d = jwtDecode(token);
        setUsername(d.username || user || "Usuário");
        setCargo(d.is_staff ? "Professor" : "Aluno");
        // SimpleJWT expõe normalmente user_id
        setAlunoId(d.user_id ?? d.id ?? null);
      } catch {
        setUsername(user || "Usuário");
      }
    } else {
      setUsername(user || "Usuário");
    }

    // busca foto de perfil
    if (token && user) {
      axios
        .get(`http://127.0.0.1:8000/api/usuarios/${user}/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(r => {
          if (r.data.foto_perfil) {
            setFotoUrl(`http://127.0.0.1:8000${r.data.foto_perfil}`);
          }
        })
        .catch(() => {});
    }
  }, []);

  /* ───────── carrega aulas e entregas, filtra pendentes ───────── */
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token || !alunoId) return;

    async function fetchData() {
      try {
        // busca simultânea de aulas e entregas
        const [aulasRes, entregasRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/aulas/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/entregas/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const listaAulas   = Array.isArray(aulasRes.data) ? aulasRes.data : [];
        const listaEntregas = Array.isArray(entregasRes.data) ? entregasRes.data : [];

        // monta Set de IDs de aulas já entregues por este aluno
        const entreguesIds = new Set(
          listaEntregas
            .filter(e => Number(e.aluno) === Number(alunoId))
            .map(e => Number(e.aula))
        );

        const hoje  = dayjs();
        // filtra por categoria e remove as entregues
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

  /* ───────── lista fallback p/ demos ───────── */
  const demos = [
    {
      id: -1,
      titulo: "Introdução à Biologia",
      descricao: "Vídeo de amostra – introdução ao curso.",
      thumb: "https://placehold.co/600x340?text=Biologia",
    },
    {
      id: -2,
      titulo: "História do Brasil",
      descricao: "Conheça os principais fatos históricos.",
      thumb: "https://placehold.co/600x340?text=História",
    },
    {
      id: -3,
      titulo: "Fundamentos de Matemática",
      descricao: "Revisão de conceitos básicos.",
      thumb: "https://placehold.co/600x340?text=Matemática",
    },
  ];

  // se não houver aulas da semana, mostra demos
  const pendentes = aulasSemana.length === 0 ? demos : aulasSemana;

  /* ───────── helpers ───────── */
  const renderLista = lista => (
    <div className="space-y-4">
      {lista.map(a => (
        <div key={a.id} className="rounded border border-green-300 bg-green-50 p-4 shadow-sm">
          <h3 className="text-xl font-bold text-green-800">{a.titulo}</h3>
          <p className="mb-2 text-gray-700">{a.descricao}</p>
          <p className="text-sm text-gray-600">
            📅 {a.data_postagem ? `Postada em ${dayjs(a.data_postagem).format("DD/MM/YYYY")}` : "Vídeo-amostra"}
          </p>
        </div>
      ))}
    </div>
  );

  /* ───────── UI ───────── */
  return (
    <div className="flex">
      <Sidebar isAluno />

      <main className="ml-64 flex-1 bg-gray-50 p-6 text-black">
        {/* top bar */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-3 rounded border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <img src={fotoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="text-right">
              <p className="font-semibold">{username}</p>
              <p className="text-sm text-gray-500">{cargo}</p>
            </div>
          </div>
        </div>

        {/* cards topo */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            ["hoje",   "📅 Aulas de Hoje",   aulasHoje],
            ["semana", "🗓️ Aulas da Semana", aulasSemana],
            ["mes",    "📘 Aulas do Mês",    aulasMes],
          ].map(([key, titulo, lista]) => (
            <div
              key={key}
              onClick={() => setModalAberto(key)}
              className="cursor-pointer rounded-xl border border-green-300 bg-green-100 p-6 text-center shadow hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-green-800">{titulo}</h2>
              <p className="mt-2 text-gray-600">{lista.length} aula(s)</p>
            </div>
          ))}
        </div>

        {/* aulas pendentes */}
        <h2 className="mb-3 text-2xl font-semibold text-green-700">
          Aulas que você ainda não viu
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pendentes.map(a => (
            <VideoCard
              key={a.id}
              aula={a}
              thumb={a.thumb}
              onAssistir={() => (window.location.href = "/aulas")}
            />
          ))}
        </div>

        {/* modal de períodos */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <button
                onClick={() => setModalAberto(null)}
                className="absolute right-4 top-3 text-lg text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
              <h2 className="mb-4 text-2xl font-bold">
                {modalAberto === "hoje"   && "Aulas de Hoje"}
                {modalAberto === "semana" && "Aulas da Semana"}
                {modalAberto === "mes"    && "Aulas do Mês"}
              </h2>
              {modalAberto === "hoje"   && renderLista(aulasHoje)}
              {modalAberto === "semana" && renderLista(aulasSemana)}
              {modalAberto === "mes"    && renderLista(aulasMes)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
