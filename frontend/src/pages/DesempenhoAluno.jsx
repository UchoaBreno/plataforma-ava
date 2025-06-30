import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DesempenhoAluno() {
  const [notas, setNotas] = useState([]);
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/desempenhos/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotas(res.data);
      } catch (error) {
        console.error("Erro ao buscar desempenho do aluno:", error);
      }
    };

    fetchNotas();
  }, [token]);

  return (
    <div className="p-6 ml-64 text-black">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Minhas Notas</h1>
      {notas.length === 0 ? (
        <p>Nenhuma nota registrada ainda.</p>
      ) : (
        notas.map((n) => (
          <div key={n.id} className="border-b py-2">
            <strong>{n.titulo}</strong>: {n.nota}
            <p className="text-sm text-gray-600">{n.descricao}</p>
          </div>
        ))
      )}
    </div>
  );
}
