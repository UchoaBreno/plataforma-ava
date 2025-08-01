import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axiosInstance from "../utils/axiosInstance";
import EditAulaModal from "./EditAulaModal";

export default function GerenciarAulasModal({ isOpen, onClose }) {
  const [aba, setAba] = useState("listar");
  const [aulas, setAulas] = useState([]);
  const [editAula, setEditAula] = useState(null);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [slide, setSlide] = useState(null);
  const [agendada, setAgendada] = useState(false);

  const [erros, setErros] = useState({});

  const recarregarAulas = async () => {
    try {
      const { data } = await axiosInstance.get("aulas/");
      setAulas(data);
    } catch {
      console.error("Erro ao buscar aulas.");
    }
  };

  const validarCampos = () => {
    const novosErros = {};
    if (!titulo.trim()) novosErros.titulo = true;
    if (!descricao.trim()) novosErros.descricao = true;
    if (!data.trim()) novosErros.data = true;
    if (!hora.trim()) novosErros.hora = true;
    if (!slide) novosErros.slide = true;
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const publicarAula = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descricao", descricao);
    fd.append("data", data);
    fd.append("hora", hora);
    if (slide) fd.append("arquivo", slide);
    fd.append("agendada", aba === "agendar" ? "true" : "false");

    try {
      await axiosInstance.post("aulas/", fd);
      alert("Aula publicada!");
      recarregarAulas();
      setAba("listar");
      setTitulo("");
      setDescricao("");
      setData("");
      setHora("");
      setSlide(null);
      setAgendada(false);
      setErros({});
    } catch (err) {
      console.error("Erro ao publicar aula:", err.response?.data || err);
      alert("Erro ao publicar aula. Verifique os campos obrigatórios.");
    }
  };

  const apagarAula = async (id) => {
    if (!window.confirm("Apagar esta aula?")) return;
    try {
      await axiosInstance.delete(`aulas/${id}/`);
      recarregarAulas();
    } catch {
      alert("Erro ao apagar aula.");
    }
  };

  useEffect(() => {
    recarregarAulas();
  }, []);

  if (!isOpen) return null;

  const inputClass = (erro) =>
    `w-full rounded border px-3 py-2 ${
      erro
        ? "border-red-500 dark:border-red-400"
        : "border-gray-300 dark:border-gray-600"
    } bg-white dark:bg-gray-700`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2">
      <div className="relative flex h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          ✖
        </button>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 p-4">
          {["listar", "aula", "agendar"].map((key) => (
            <button
              key={key}
              onClick={() => setAba(key)}
              className={`rounded px-3 py-1 text-sm font-medium ${
                aba === key
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
              }`}
            >
              {key === "listar"
                ? "Ver aulas publicadas"
                : key === "aula"
                ? "Publicar aula"
                : "Agendar aula"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {aba === "listar" && (
            <div className="space-y-3">
              {aulas.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">
                  Nenhuma aula cadastrada.
                </p>
              ) : (
                aulas.map((a) => (
                  <div
                    key={a.id}
                    className="rounded border border-green-300 bg-green-50 dark:bg-gray-700 p-3 shadow"
                  >
                    <p className="font-semibold">{a.titulo}</p>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                      Agendada para {dayjs(a.data).format("DD/MM/YYYY")}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditAula(a)}
                        className="rounded bg-yellow-500 hover:bg-yellow-600 px-3 py-1 text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => apagarAula(a.id)}
                        className="rounded bg-red-600 hover:bg-red-700 px-3 py-1 text-white"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {(aba === "aula" || aba === "agendar") && (
            <form onSubmit={publicarAula} className="space-y-3">
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className={inputClass(erros.titulo)}
                placeholder="Título"
              />
              {erros.titulo && <p className="text-sm text-red-500">Preencha o título</p>}

              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={inputClass(erros.descricao)}
                placeholder="Descrição"
              />
              {erros.descricao && <p className="text-sm text-red-500">Preencha a descrição</p>}

              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className={inputClass(erros.data)}
              />
              {erros.data && <p className="text-sm text-red-500">Preencha a data</p>}

              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className={inputClass(erros.hora)}
              />
              {erros.hora && <p className="text-sm text-red-500">Preencha o horário</p>}

              <input
                type="file"
                accept=".pdf"
                className={`w-full text-sm ${erros.slide ? "border-red-500 border rounded" : ""}`}
                onChange={(e) => setSlide(e.target.files[0])}
              />
              {erros.slide && <p className="text-sm text-red-500">Escolha um arquivo PDF</p>}

              <button className="rounded bg-green-600 hover:bg-green-700 px-4 py-2 font-medium text-white">
                {aba === "agendar" ? "Agendar Aula" : "Publicar Aula"}
              </button>
            </form>
          )}
        </div>

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
