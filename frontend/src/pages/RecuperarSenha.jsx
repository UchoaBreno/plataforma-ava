import React, { useState } from "react";
import axios from "../utils/axiosInstance";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async () => {
    setErro("");
    setMensagem("");
    try {
      await axios.post("users/reset_password/", { email });
      setMensagem("Verifique seu e-mail para redefinir sua senha.");
    } catch {
      setErro("Erro ao solicitar redefinição de senha.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 border border-gray-300 dark:border-gray-700 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Recuperar Senha</h1>

        {mensagem && <p className="text-green-700">{mensagem}</p>}
        {erro && <p className="text-red-700">{erro}</p>}

        <input
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          type="email"
          placeholder="Seu e-mail cadastrado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Enviar link de redefinição
        </button>
      </div>
    </div>
  );
}
