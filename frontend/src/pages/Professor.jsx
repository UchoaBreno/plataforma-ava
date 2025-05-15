import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar             from "../components/Sidebar";
import GerenciarAulasModal from "../components/GerenciarAulasModal";
import VideoCard           from "../components/VideoCard";

export default function Professor() {
  const [username, setUsername] = useState("Professor");
  const [fotoUrl,  setFotoUrl]  = useState("https://i.pravatar.cc/100?img=3");

  const [showGerenciar, setShowGerenciar] = useState(false);
  const [aulas, setAulas] = useState([]);

  const navigate = useNavigate();
  const token    = localStorage.getItem("access");
  const user     = localStorage.getItem("username");

  /* ─── carregar perfil + aulas ─── */
  const carregarAulas = () =>
    axios
      .get("http://127.0.0.1:8000/api/aulas/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setAulas(r.data))
      .catch(console.error);

  useEffect(() => {
    if (!token) return navigate("/");

    if (user) setUsername(user);

    axios
      .get(`http://127.0.0.1:8000/api/usuarios/${user}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) =>
        r.data.foto_perfil &&
        setFotoUrl(`http://127.0.0.1:8000${r.data.foto_perfil}`)
      )
      .catch(console.error);

    carregarAulas();
  }, [navigate, token, user]);

  /* ─── troca foto ─── */
  const handleFoto = async (e) => {
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
      alert("Falha ao enviar imagem");
    }
  };

  /* ─── ações dos cards ─── */
  const editar = () =>
    alert("Clique em 'Gerenciar Aulas' e use a aba LISTAR para editar.");
  const apagar = async (id) => {
    if (!window.confirm("Apagar esta aula?")) return;
    await axios.delete(`http://127.0.0.1:8000/api/aulas/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    carregarAulas();
  };

  /* ─── render ─── */
  return (
    <div className="flex">
      <Sidebar isStaff />

      <main className="ml-64 flex-1 bg-gray-50 p-6">
        {/* topo */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-green-600">
            Painel do Professor
          </h1>

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
                className="hidden"
                onChange={handleFoto}
              />
            </label>
            <div className="text-right">
              <p className="font-semibold">{username}</p>
              <p className="text-sm text-gray-500">Professor</p>
            </div>
          </div>
        </div>

        {/* card que abre o modal */}
        <div
          onClick={() => setShowGerenciar(true)}
          className="mb-6 cursor-pointer rounded-xl border border-green-200 bg-white p-6 text-center shadow hover:bg-green-50"
        >
          <h2 className="text-xl font-semibold text-green-700">
            Gerenciar Aulas
          </h2>
          <p className="text-gray-600">
            Clique para ver, editar ou publicar aulas / atividades.
          </p>
        </div>

        {/* ▼ seção de amostras */}
        <h2 className="mb-3 text-xl font-bold text-green-600">
          Minhas aulas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aulas.slice(0, 3).map((a) => (
            <VideoCard
              key={a.id}
              aula={a}
              isProfessor
              onEditar={editar}
              onApagar={apagar}
            />
          ))}
        </div>

        {/* modal */}
        <GerenciarAulasModal
          isOpen={showGerenciar}
          onClose={() => {
            setShowGerenciar(false);
            carregarAulas();
          }}
        />
      </main>
    </div>
  );
}
