import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function RecuperarSenha() {
  const [username, setUsername] = useState("");
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setErro("");
    setMensagem("");

    if (!username || !senhaAntiga || !novaSenha) {
      setErro("❌ Por favor, preencha todos os campos.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("❌ A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      const response = await axios.post("change_password/", {
        username,
        old_password: senhaAntiga,
        new_password: novaSenha,
      });

      if (response.status === 200) {
        setMensagem("✅ Senha alterada com sucesso! Redirecionando para o login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErro("❌ Erro ao alterar senha. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro:", err.response?.data || err);
      if (err.response?.data?.detail) {
        setErro("❌ " + err.response.data.detail);
      } else {
        setErro("❌ Erro ao alterar senha. Verifique os dados e tente novamente.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
          Plataforma<span className="text-green-500">AVA</span>
        </h2>
        <p className="text-black dark:text-gray-300">Troque sua senha</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Preencha os campos abaixo
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
          className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          placeholder="Nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          type="password"
          placeholder="Senha atual"
          value={senhaAntiga}
          onChange={(e) => setSenhaAntiga(e.target.value)}
        />

        <input
          className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          type="password"
          placeholder="Nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 mb-3"
        >
          Confirmar troca de senha
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full border border-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white py-2 rounded"
        >
          Voltar para o login
        </button>
      </div>
    </div>
  );
}
