// src/components/GerenciarAulasModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import EditAulaModal from "./EditAulaModal";

export default function GerenciarAulasModal({ isOpen, onClose }) {
  const token = localStorage.getItem("access");

  /* ─────────── state ─────────── */
  const [aba, setAba] = useState("listar"); // listar | aula | atv
  const [aulas, setAulas] = useState([]);
  const [editAula, setEditAula] = useState(null);

  /* form aula */
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataPost, setDataPost] = useState("");
  const [slide, setSlide] = useState(null);

  /* form atividade (apenas visual) */
  const [descAtv, setDescAtv] = useState("");
  const [dataEnt, setDataEnt] = useState("");
  const [horaEnt, setHoraEnt] = useState("");
  const [pont, setPont] = useState("");

  /* entregas reais */
  const [entregues, setEntregues] = useState([]);

  /* ─────────── helpers ─────────── */
  const recarregarAulas = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/aulas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAulas(data);
    } catch {
      // silenciar
    }
  };

  const recarregarEntregas = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/entregas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntregues(data);
    } catch {
      // silenciar
    }
  };

  const publicarAula = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descricao", descricao);
    fd.append("data_postagem", dataPost);
    if (slide) fd.append("slide", slide);

    try {
      await axios.post("http://127.0.0.1:8000/api/aulas/", fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Aula publicada!");
      recarregarAulas();
      setAba("listar");
      setTitulo("");
      setDescricao("");
      setDataPost("");
      setSlide(null);
    } catch {
      alert("Erro ao publicar aula");
    }
  };

  const publicarAtividade = (e) => {
    e.preventDefault();
    // aqui você pode postar sua atividade via API, se tiver
    alert("Atividade publicada (exemplo)!");
    setAba("listar");
    setDescAtv("");
    setDataEnt("");
    setHoraEnt("");
    setPont("");
  };

  const apagarAula = async (id) => {
    if (!window.confirm("Apagar esta aula?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/aulas/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      recarregarAulas();
    } catch {
      alert("Erro ao apagar");
    }
  };

  /* ─────────── carregamento inicial ─────────── */
  useEffect(() => {
    if (!token) return;
    recarregarAulas();
    recarregarEntregas();
  }, [token]);

  if (!isOpen) return null;

  /* ─────────── render ─────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative flex h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
        {/* fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-lg text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {/* abas */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 p-4">
          {[
            ["listar", "Ver aulas publicadas"],
            ["aula", "Publicar aula"],
            ["atv", "Publicar atividade"],
          ].map(([key, rotulo]) => (
            <button
              key={key}
              onClick={() => setAba(key)}
              className={`rounded px-3 py-1 text-sm font-medium ${
                aba === key ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {/* conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* LISTAR */}
          {aba === "listar" && (
            <div className="space-y-3">
              {aulas.length === 0 ? (
                <p className="text-gray-600">Nenhuma aula cadastrada.</p>
              ) : (
                aulas.map((a) => (
                  <div
                    key={a.id}
                    className="rounded border border-green-300 bg-green-50 p-3 shadow"
                  >
                    <p className="font-semibold">{a.titulo}</p>
                    <p className="mb-2 text-sm text-gray-600">
                      Publicada em {dayjs(a.data_postagem).format("DD/MM/YYYY")}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditAula(a)}
                        className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => apagarAula(a.id)}
                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PUBLICAR AULA */}
          {aba === "aula" && (
            <form onSubmit={publicarAula} className="space-y-3">
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="Título"
                required
              />
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="Descrição"
              />
              <input
                type="date"
                value={dataPost}
                onChange={(e) => setDataPost(e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
              />
              <input
                type="file"
                accept=".pdf"
                className="w-full"
                onChange={(e) => setSlide(e.target.files[0])}
              />
              <button className="rounded bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600">
                Publicar Aula
              </button>
            </form>
          )}

          {/* PUBLICAR ATIVIDADE */}
          {aba === "atv" && (
            <form onSubmit={publicarAtividade} className="space-y-3">
              <textarea
                value={descAtv}
                onChange={(e) => setDescAtv(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="Descrição da atividade"
                required
              />
              <label className="block text-sm font-medium">Data de entrega</label>
              <input
                type="date"
                value={dataEnt}
                onChange={(e) => setDataEnt(e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
              />
              <label className="block text-sm font-medium">Hora de entrega</label>
              <input
                type="time"
                value={horaEnt}
                onChange={(e) => setHoraEnt(e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
              />
              <input
                type="number"
                min="0"
                value={pont}
                onChange={(e) => setPont(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="Pontuação"
                required
              />
              <button className="rounded bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600">
                Publicar Atividade
              </button>
            </form>
          )}
        </div>

        {/* modal edição de aula */}
        {editAula && (
          <EditAulaModal
            aula={editAula}
            onClose={() => setEditAula(null)}
            onSaved={() => {
              setEditAula(null);
              recarregarAulas();
            }}
            onDeleted={() => {
              setEditAula(null);
              recarregarAulas();
            }}
          />
        )}
      </div>
    </div>
  );
}
