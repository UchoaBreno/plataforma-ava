// src/pages/AulasAluno.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";

/* ▸ limites (dias) para mudar de prioridade --------------------- */
const LIMITE_MEDIA = 7;    // até 7 dias  → prioridade média
const LIMITE_BAIXA = 31;   // até 31 dias → prioridade baixa

export default function AulasAluno() {
  const token = localStorage.getItem("access");

  /* ▸ perfil e identificação do aluno --------------------------- */
  const [username, setUsername] = useState("Usuário");
  const [fotoUrl,  setFotoUrl]  = useState("https://i.pravatar.cc/100?img=3");
  const [alunoId,  setAlunoId]  = useState(null);

  /* ▸ listas de prioridade -------------------------------------- */
  const [alta,  setAlta]  = useState([]);   // hoje / atrasada
  const [media, setMedia] = useState([]);   // próximos 7 dias
  const [baixa, setBaixa] = useState([]);   // até 31 dias

  /* ▸ pop-up de entrega visível? --------------------------------*/
  const [showEntrega, setShowEntrega] = useState(false);

  /* ─── Decodifica o token para pegar username e alunoId ───────── */
  useEffect(() => {
    if (!token) return;
    let decoded = {};
    try {
      decoded = jwtDecode(token);
    } catch { /* falha ao decodificar */ }

    const uLS = localStorage.getItem("username");
    setUsername(decoded.username || uLS || "Usuário");

    // extrai ID do aluno (SimpleJWT geralmente usa user_id)
    const id = decoded.user_id ?? decoded.id;
    if (id) setAlunoId(id);

    // busca foto de perfil
    if (decoded.username) {
      axios
        .get(`http://127.0.0.1:8000/api/usuarios/${decoded.username}/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(r => {
          if (r.data.foto_perfil) {
            setFotoUrl(`http://127.0.0.1:8000${r.data.foto_perfil}`);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  /* ─── Quando tivermos alunoId, carrega prioridades e agenda ──── */
  useEffect(() => {
    if (!token || !alunoId) return;
    carregarPrioridades();
    const intervalo = setInterval(carregarPrioridades, 60 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [token, alunoId]);

  /* ─────────────────────────── funções principais ─────────────────────────── */
  async function carregarPrioridades() {
    try {
      // busca todas as aulas e todas as entregas (do próprio aluno)
      const [aulasRes, entregasRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/aulas/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://127.0.0.1:8000/api/entregas/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const aulas    = Array.isArray(aulasRes.data) ? aulasRes.data : [];
      const entregas = Array.isArray(entregasRes.data) ? entregasRes.data : [];

      // filtra só as entregas deste aluno e extrai IDs das aulas
      const minhasEntregasIds = new Set(
        entregas
          .filter(e => e.aluno === alunoId)
          .map(e => Number(e.aula))
      );

      // separa aulas não entregues em alta, média e baixa
      const hoje = dayjs().startOf("day");
      const _alta  = [], _media = [], _baixa = [];

      aulas
        .filter(a => !minhasEntregasIds.has(Number(a.id)))
        .forEach(a => {
          const limite = a.data_agendada || a.data_postagem;
          if (!limite) return;
          const diff = dayjs(limite).startOf("day").diff(hoje, "day");
          if (diff <= 0)                 _alta.push(a);
          else if (diff <= LIMITE_MEDIA) _media.push(a);
          else if (diff <= LIMITE_BAIXA) _baixa.push(a);
        });

      setAlta(_alta);
      setMedia(_media);
      setBaixa(_baixa);
    } catch (err) {
      console.error("Erro ao carregar prioridades:", err);
    }
  }

  /* troca foto opcional */
  const trocarFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("foto_perfil", file);

    try {
      const r = await axios.post(
        "http://127.0.0.1:8000/api/foto-perfil/",
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFotoUrl(`http://127.0.0.1:8000${r.data.foto_url}`);
    } catch {
      alert("Falha ao atualizar foto.");
    }
  };

  /* ───────────────────── componentes auxiliares ───────────────────── */
  const CardPrioridade = ({ titulo, corBg, corBorda, lista }) => (
    <div className={`rounded-xl border ${corBorda} ${corBg} p-5 shadow`}>
      <h2 className="mb-3 text-xl font-bold">{titulo}</h2>
      {lista.length === 0 ? (
        <p className="text-gray-600">Nenhuma aula nesta prioridade.</p>
      ) : (
        <div className="max-h-[50vh] space-y-3 overflow-auto pr-1">
          {lista.map(a => {
            let link = "#";
            if (a.slide) {
              link = a.slide.startsWith("http")
                ? a.slide
                : `http://127.0.0.1:8000${a.slide}`;
            } else if (a.link_reuniao) {
              link = a.link_reuniao;
            }
            return (
              <a
                key={a.id}
                href={link}
                target={link !== "#" ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="block rounded border border-white/40 bg-white/70 px-4 py-3 hover:bg-white"
              >
                <p className="font-semibold text-green-800">{a.titulo}</p>
                <p className="text-sm text-gray-600">
                  Prazo:{" "}
                  {dayjs(a.data_agendada || a.data_postagem).format("DD/MM/YYYY")}
                </p>
                {a.descricao && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-700">
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
    const [selAula, setSelAula]       = useState("");
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
        await axios.post(
          "http://127.0.0.1:8000/api/entregas/",
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Enviado!");
        setShowEntrega(false);
        await carregarPrioridades(); // atualiza logo após enviar
      } catch (err) {
        console.error(err.response?.data || err);
        alert("Erro ao enviar.");
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex justify-end pt-6 pr-6">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setShowEntrega(false)}
        />
        <form
          onSubmit={enviar}
          className="relative z-10 w-full max-w-sm rounded-lg bg-white p-5 shadow-lg"
        >
          <h3 className="mb-4 text-lg font-semibold text-green-700">
            Entregar atividade
          </h3>
          <label className="mb-2 block text-sm font-medium">
            Selecione a aula:
          </label>
          <select
            value={selAula}
            onChange={(e) => setSelAula(e.target.value)}
            className="mb-4 w-full rounded border px-3 py-2"
            required
          >
            <option value="">-- escolha --</option>
            {[...alta, ...media, ...baixa].map((a) => (
              <option key={a.id} value={a.id}>
                {a.titulo}
              </option>
            ))}
          </select>
          <label className="mb-2 block text-sm font-medium">Arquivo</label>
          <input
            type="file"
            onChange={(e) => setSelArquivo(e.target.files[0] || null)}
            className="mb-4 w-full"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEntrega(false)}
              className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded bg-green-500 px-4 py-1 font-medium text-white hover:bg-green-600"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    );
  };

  /* ─────────────────────────── Render ─────────────────────────── */
  return (
    <div className="flex">
      <Sidebar isAluno />

      <main className="relative ml-64 flex-1 bg-gray-50 p-6 text-black">
        {/* perfil */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-3 rounded border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <label htmlFor="foto-perfil" className="cursor-pointer">
              <img
                src={fotoUrl}
                alt="perfil"
                className="h-10 w-10 rounded-full object-cover"
              />
              <input
                id="foto-perfil"
                type="file"
                accept="image/*"
                onChange={trocarFoto}
                className="hidden"
              />
            </label>
            <div className="text-right">
              <p className="font-semibold">{username}</p>
              <p className="text-sm text-gray-500">Aluno</p>
            </div>
          </div>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-green-600">Minhas Aulas</h1>

        {/* botão flutuante */}
        <button
          onClick={() => setShowEntrega(true)}
          className="fixed right-6 top-24 z-40 rounded-full bg-green-600 px-4 py-2 font-medium text-white shadow-lg hover:bg-green-700"
        >
          Entregar atividade
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CardPrioridade
            titulo="Alta prioridade (vence hoje)"
            corBg="bg-red-50"
            corBorda="border-red-300"
            lista={alta}
          />
          <CardPrioridade
            titulo="Média prioridade (próx. 7 dias)"
            corBg="bg-yellow-50"
            corBorda="border-yellow-300"
            lista={media}
          />
          <CardPrioridade
            titulo="Baixa prioridade (até 31 dias)"
            corBg="bg-blue-50"
            corBorda="border-blue-300"
            lista={baixa}
          />
        </div>

        {showEntrega && <EntregarModal />}
      </main>
    </div>
  );
}
