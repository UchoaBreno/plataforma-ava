import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const fetchSolicitacoes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "http://127.0.0.1:8000/admin/solicitacoes-professor/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (Array.isArray(data)) {
        setSolicitacoes(data);
      } else if (Array.isArray(data.results)) {
        setSolicitacoes(data.results);
      } else {
        setSolicitacoes([]);
      }
    } catch (err) {
      console.error("Erro ao buscar solicitações", err);
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const aprovar = async (id) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/admin/solicitacoes-professor/${id}/aprovar/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSolicitacoes();
    } catch (err) {
      console.error("Erro ao aprovar", err);
    }
  };

  const rejeitar = async (id) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/admin/solicitacoes-professor/${id}/rejeitar/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSolicitacoes();
    } catch (err) {
      console.error("Erro ao rejeitar", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      <h2 className="text-xl font-semibold mb-4">Solicitações de Professores</h2>

      {loading ? (
        <p>🔄 Carregando...</p>
      ) : solicitacoes.length === 0 ? (
        <p className="text-gray-600">Nenhuma solicitação encontrada.</p>
      ) : (
        <div className="space-y-4 w-full max-w-2xl">
          {solicitacoes.map((s) => (
            <div
              key={s.id}
              className="rounded border p-4 bg-white dark:bg-gray-800 shadow flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {s.nome} {s.sobrenome}
                </p>
                <p className="text-sm text-gray-600">{s.email}</p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  {s.aprovado ? (
                    <span className="text-green-600">✅ Aprovado</span>
                  ) : (
                    <span className="text-yellow-600">⏳ Pendente</span>
                  )}
                </p>
              </div>
              {!s.aprovado && (
                <div className="flex gap-2">
                  <button
                    onClick={() => aprovar(s.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => rejeitar(s.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
