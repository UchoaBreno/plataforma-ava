import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erroLogin, setErroLogin] = useState("");

  const handleLogin = async () => {
    setErroLogin("");
    try {
      const response = await axios.post("token/", {
        username,
        password,
      });

      const { access, refresh } = response.data;
      const decoded = jwtDecode(access);

      const isStaff = decoded.is_staff === true || decoded.is_staff === "true";
      const isSuperuser =
        decoded.is_superuser === true || decoded.is_superuser === "true";
      const userFromBackend = decoded.username;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("username", userFromBackend);
      localStorage.setItem("is_staff", JSON.stringify(isStaff));
      localStorage.setItem("is_superuser", JSON.stringify(isSuperuser));
      localStorage.removeItem("fotoPerfil");

      if (isSuperuser) {
        window.location.href = "/admin-dashboard";
      } else if (isStaff) {
        window.location.href = "/professor";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setErroLogin("Usuário ou senha incorretos ou erro no servidor.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 border border-gray-300 dark:border-gray-700 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-1">
          Plataforma<span className="text-green-500">AVA</span>
        </h1>
        <p className="text-black dark:text-gray-300 text-base mb-1">
          Entre com sua conta
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Informe seu usuário e senha para entrar
        </p>

        {erroLogin && (
          <div className="text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600 px-4 py-2 rounded text-center mb-4">
            {erroLogin}
          </div>
        )}

        <input
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-md mb-3"
        >
          Entrar
        </button>
        <button
          onClick={() => (window.location.href = "/cadastro")}
          className="w-full border border-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white py-2 rounded-md"
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}
