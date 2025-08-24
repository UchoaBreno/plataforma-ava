// src/pages/RecuperarSenha.jsx
import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

/**
 * Fluxos suportados:
 * - "change": usuário sabe a senha atual e quer trocar
 * - "forgot": usuário não lembra a senha; envia e-mail com link/código para redefinir
 *
 * Ajuste as rotas abaixo conforme seu backend.
 */
const CHANGE_PASSWORD_ENDPOINT = "change_password/";          // já existente no seu backend
const FORGOT_PASSWORD_ENDPOINT = "password-reset/request/";   // crie esta rota no backend (Django REST, por ex.)

export default function RecuperarSenha() {
  const [mode, setMode] = useState("change"); // 'change' | 'forgot'
  const [username, setUsername] = useState("");
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const [identifier, setIdentifier] = useState(""); // username ou e-mail para fluxo "forgot"

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const resetFeedback = () => {
    setErro("");
    setMensagem("");
  };

  const handleSubmitChange = async () => {
    resetFeedback();

    if (!username || !senhaAntiga || !novaSenha) {
      setErro("❌ Por favor, preencha todos os campos.");
      return;
    }
    if (novaSenha.length < 6) {
      setErro("❌ A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setCarregando(true);
      const response = await axios.post(CHANGE_PASSWORD_ENDPOINT, {
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
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmitForgot = async () => {
    resetFeedback();

    if (!identifier) {
      setErro("❌ Informe seu nome de usuário OU e-mail para enviarmos o link de redefinição.");
      return;
    }

    try {
      setCarregando(true);
      const response = await axios.post(FORGOT_PASSWORD_ENDPOINT, {
        identifier: identifier.trim(),
      });

      if (response.status === 200) {
        setMensagem("✅ Enviamos um e-mail com instruções para redefinir sua senha (verifique também a caixa de spam).");
      } else {
        setErro("❌ Não foi possível enviar o e-mail. Tente novamente em alguns instantes.");
      }
    } catch (err) {
      console.error("Erro:", err.response?.data || err);
      if (err.response?.status === 404) {
        setErro("❌ Usuário/e-mail não encontrado. Confira os dados e tente novamente.");
      } else if (err.response?.data?.detail) {
        setErro("❌ " + err.response.data.detail);
      } else {
        setErro("❌ Ocorreu um erro ao enviar o e-mail de recuperação. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 sm:p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
          Plataforma<span className="text-green-500">AVA</span> — B‑High Education
        </h2>

        {/* Tabs de modo */}
        <div className="mt-3 mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setMode("change"); resetFeedback(); }}
            className={`py-2 rounded border text-sm font-medium ${
              mode === "change"
                ? "bg-green-600 text-white border-green-600"
                : "bg-transparent text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Sei minha senha
          </button>
          <button
            type="button"
            onClick={() => { setMode("forgot"); resetFeedback(); }}
            className={`py-2 rounded border text-sm font-medium ${
              mode === "forgot"
                ? "bg-green-600 text-white border-green-600"
                : "bg-transparent text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Não sei minha senha
          </button>
        </div>

        {/* Mensagens */}
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

        {/* Fluxo: Sei minha senha (troca direta) */}
        {mode === "change" && (
          <>
            <p className="text-black dark:text-gray-300">Trocar senha</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Preencha os campos abaixo para alterar sua senha.
            </p>

            <input
              className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="Nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={carregando}
            />

            <input
              className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
              type="password"
              placeholder="Senha atual"
              value={senhaAntiga}
              onChange={(e) => setSenhaAntiga(e.target.value)}
              disabled={carregando}
            />

            <input
              className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
              type="password"
              placeholder="Nova senha (mín. 6 caracteres)"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              disabled={carregando}
            />

            <button
              onClick={handleSubmitChange}
              disabled={carregando}
              className={`w-full ${
                carregando ? "bg-green-400" : "bg-green-600 hover:bg-green-500"
              } text-white py-2 rounded mb-3 transition-colors`}
            >
              {carregando ? "Processando..." : "Confirmar troca de senha"}
            </button>
          </>
        )}

        {/* Fluxo: Não sei minha senha (envio de e-mail) */}
        {mode === "forgot" && (
          <>
            <p className="text-black dark:text-gray-300">Esqueci minha senha</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Informe seu <strong>nome de usuário ou e‑mail</strong> e enviaremos um link de
              redefinição de senha. Por segurança, não enviamos a senha atual por e‑mail.
            </p>

            <input
              className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="Usuário OU e‑mail"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={carregando}
            />

            <button
              onClick={handleSubmitForgot}
              disabled={carregando}
              className={`w-full ${
                carregando ? "bg-green-400" : "bg-green-600 hover:bg-green-500"
              } text-white py-2 rounded mb-3 transition-colors`}
            >
              {carregando ? "Enviando..." : "Enviar e‑mail de recuperação"}
            </button>

            <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Após redefinir a senha pelo link recebido, você pode voltar aqui e usar o modo
              <em> “Sei minha senha”</em> para trocá‑la novamente quando quiser.
            </div>
          </>
        )}

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
