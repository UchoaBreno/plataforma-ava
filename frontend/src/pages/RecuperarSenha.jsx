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
      setMensagem("📧 Verifique seu e-mail para redefinir sua senha.");
    } catch {
      setErro("❌ Erro ao solicitar redefinição de senha.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 border border-gray-300 dark:border-gray-700 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-1">
          Plataforma<span className="text-green-500">AVA</span>
        </h1>
        <p className="text-black dark:text-gray-300 text-base mb-1">
          Recuperação de senha
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Informe seu e-mail para receber o link de redefinição
        </p>

        {mensagem && (
          <div className="text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300 border border-green-300 dark:border-green-600 px-4 py-2 rounded text-center mb-4 text-sm">
            {mensagem}
          </div>
        )}
        {erro && (
          <div className="text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600 px-4 py-2 rounded text-center mb-4 text-sm">
            {erro}
          </div>
        )}

        <input
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="email"
          placeholder="Seu e-mail cadastrado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-md mb-3"
        >
          Enviar link de redefinição
        </button>

        <button
          onClick={() => (window.location.href = "/login")}
          className="w-full border border-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white py-2 rounded"
        >
          Voltar para o login
        </button>
      </div>
    </div>
  );
}
