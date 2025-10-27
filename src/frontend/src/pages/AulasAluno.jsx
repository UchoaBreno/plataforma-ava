import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../utils/axiosInstance";

const LIMITE_MEDIA = 7;
const LIMITE_BAIXA = 31;

export default function AulasAluno() {
  const token = localStorage.getItem("access");

  const [alunoId, setAlunoId] = useState(null);
  const [alta, setAlta] = useState([]);
  const [media, setMedia] = useState([]);
  const [baixa, setBaixa] = useState([]);
  const [showEntrega, setShowEntrega] = useState(false);

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
      alert("Erro ao carregar suas aulas.");
    }
  }

  const CardPrioridade = ({ titulo, lista, borda }) => (
    <div className={`rounded border ${borda} bg-white dark:bg-gray-800 p-4 shadow`}>
      <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
        {titulo}
      </h2>
      {lista.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">Nenhuma aula nesta prioridade.</p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {lista.map(a => {
            let link = "#";
            if (a.arquivo) {
              link = a.arquivo.startsWith("http") ? a.arquivo : `${axiosInstance.defaults.baseURL}${a.arquivo}`;
            } else if (a.video_url) {
              link = a.video_url;
            }
            return (
              <a
                key={a.id}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded border border-green-100 bg-green-50 dark:bg-gray-700 px-3 py-2 hover:bg-green-100 dark:hover:bg-gray-600"
              >
                <p className="text-sm font-medium text-green-900 dark:text-green-300">
                  {a.titulo}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Prazo: {dayjs(a.data).format("DD/MM/YYYY")}
                </p>
                {a.descricao && (
                  <p className="text-xs mt-1 text-gray-700 dark:text-gray-400">
                    {a.descricao}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );

  const EntregarModal = () => {
    const [selAula, setSelAula] = useState("");
    const [selArquivo, setSelArquivo] = useState(null);

    const enviar = async (e) => {
      e.preventDefault();
      if (!selAula || !selArquivo) {
        alert("Escolha aula e arquivo.");
        return;
      }
      const fd = new FormData();
      fd.append("aula", parseInt(selAula, 10));
      fd.append("arquivo", selArquivo);

      try {
        await axiosInstance.post("entregas/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Atividade enviada!");
        setShowEntrega(false);
        await carregarPrioridades();
      } catch (err) {
        console.error(err.response?.data || err);
        alert("Erro ao enviar atividade.");
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
        <div className="relative w-full max-w-sm rounded bg-white dark:bg-gray-800 p-4 shadow-lg">
          <button
            onClick={() => setShowEntrega(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-black dark:hover:text-white"
          >
            ✖
          </button>
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">
            Entregar atividade
          </h3>
          <form onSubmit={enviar}>
            <label className="block text-sm mb-1 text-green-700 dark:text-green-400">Aula</label>
            <select
              value={selAula}
              onChange={(e) => setSelAula(e.target.value)}
              className="w-full mb-3 rounded border px-2 py-1 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">-- escolha --</option>
              {[...alta, ...media, ...baixa].map((a) => (
                <option key={a.id} value={a.id}>{a.titulo}</option>
              ))}
            </select>

            <label className="block text-sm mb-1 text-green-700 dark:text-green-400">Arquivo</label>
            <input
              type="file"
              onChange={(e) => setSelArquivo(e.target.files[0] || null)}
              className="mb-4 w-full text-xs"
              required
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEntrega(false)}
                className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isAluno />
      <main className="ml-64 flex-1 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">
            Minhas Aulas
          </h1>
          <button
            onClick={() => setShowEntrega(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Entregar atividade
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {showEntrega && <EntregarModal />}
      </main>
    </div>
  );
}
