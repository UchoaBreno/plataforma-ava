// src/pages/AtividadesProfessor.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function AtividadesProfessor() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const [atividades, setAtividades] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    data_entrega: "",
    hora_entrega: "",
    pontos: "",
  });

  useEffect(() => {
    fetchAtividades();
  }, []);

  const fetchAtividades = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/atividades/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAtividades(data);
    } catch (err) {
      console.error("Erro ao buscar atividades:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta atividade?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/atividades/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAtividades((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Erro ao deletar atividade:", err);
    }
  };

  const handleEditToggle = (atividade) => {
    setEditandoId(atividade.id);
    setForm({
      titulo: atividade.titulo,
      descricao: atividade.descricao,
      data_entrega: atividade.data_entrega,
      hora_entrega: atividade.hora_entrega,
      pontos: atividade.pontos,
    });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/atividades/${editandoId}/`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setEditandoId(null);
      fetchAtividades();
    } catch (err) {
      console.error("Erro ao editar atividade:", err);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex">
      <Sidebar isStaff={true} isAluno={false} />
      <main className="ml-64 flex-1 bg-gray-900 text-white p-6 relative">
        <h1 className="text-3xl font-bold text-green-400 mb-4">Atividades Avaliativas</h1>

        {atividades.map((a) => (
          <div key={a.id} className="bg-gray-800 p-4 rounded shadow mb-4">
            {editandoId === a.id ? (
              <>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 text-black"
                />
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 text-black"
                />
                <input
                  type="date"
                  name="data_entrega"
                  value={form.data_entrega}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 text-black"
                />
                <input
                  type="time"
                  name="hora_entrega"
                  value={form.hora_entrega}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 text-black"
                />
                <input
                  type="number"
                  name="pontos"
                  value={form.pontos}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 text-black"
                />
                <button onClick={handleEditSubmit} className="bg-green-500 text-white px-4 py-1 rounded mr-2">Salvar</button>
                <button onClick={() => setEditandoId(null)} className="bg-gray-500 text-white px-4 py-1 rounded">Cancelar</button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{a.titulo}</h2>
                <p>{a.descricao}</p>
                <p>Entrega até: {a.data_entrega} às {a.hora_entrega}</p>
                <p>Vale: {a.pontos} pontos</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEditToggle(a)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-white px-3 py-1 rounded"
                  >
                    <FaEdit className="inline-block mr-1" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
                  >
                    <FaTrash className="inline-block mr-1" /> Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <button
          onClick={() => navigate("/atividades/criar")}
          className="absolute top-6 right-6 flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          <FaPlus className="mr-2" /> Nova Atividade
        </button>
      </main>
    </div>
  );
}
