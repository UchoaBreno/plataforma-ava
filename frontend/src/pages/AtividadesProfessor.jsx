import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";

export default function AtividadesProfessor() {
  const navigate = useNavigate();
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
      const { data } = await axiosInstance.get("atividades/");
      setAtividades(data);
    } catch (err) {
      console.error("Erro ao buscar atividades:", err.response?.data || err);
      alert("Erro ao carregar atividades.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta atividade?")) return;
    try {
      await axiosInstance.delete(`atividades/${id}/`);
      setAtividades((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Erro ao deletar atividade:", err.response?.data || err);
      alert("Erro ao excluir atividade.");
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
      await axiosInstance.put(`atividades/${editandoId}/`, form);
      setEditandoId(null);
      fetchAtividades();
    } catch (err) {
      console.error("Erro ao editar atividade:", err.response?.data || err);
      alert("Erro ao editar atividade.");
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isStaff />
      <main className="ml-64 flex-1 p-6 relative">
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
          Atividades Avaliativas
        </h1>

        {atividades.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">
            Nenhuma atividade cadastrada.
          </p>
        )}

        {atividades.map((a) => (
          <div
            key={a.id}
            className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4"
          >
            {editandoId === a.id ? (
              <>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-gray-100 rounded"
                />
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-gray-100 rounded"
                />
                <input
                  type="date"
                  name="data_entrega"
                  value={form.data_entrega}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-gray-100 rounded"
                />
                <input
                  type="time"
                  name="hora_entrega"
                  value={form.hora_entrega}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-gray-100 rounded"
                />
                <input
                  type="number"
                  name="pontos"
                  value={form.pontos}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-gray-100 rounded"
                />
                <button
                  onClick={handleEditSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded mr-2"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{a.titulo}</h2>
                <p>{a.descricao}</p>
                <p>
                  Entrega até: {a.data_entrega} às {a.hora_entrega}
                </p>
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
