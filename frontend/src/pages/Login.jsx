import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erroLogin, setErroLogin] = useState("");

  const handleLogin = async () => {
    setErroLogin(""); // limpa erro antes de tentar
    try {
      // ✅ Usando endpoint JWT correto
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // ✅ Decodifica o token para extrair is_staff
      const decoded = jwtDecode(access);
      const isStaff = decoded.is_staff === true || decoded.is_staff === "true";
      const userFromBackend = decoded.username;

      // ✅ Armazena os dados no localStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("username", userFromBackend);
      localStorage.setItem("is_staff", JSON.stringify(isStaff));
      localStorage.removeItem("fotoPerfil");

      // ✅ Redireciona com base no tipo de usuário
      if (isStaff) {
        window.location.href = "/professor";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setErroLogin("Usuário ou senha incorretos. Tente novamente.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 border border-gray-300 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 mb-1">
          Plataforma<span className="text-green-500">AVA</span>
        </h1>
        <p className="text-black text-base mb-1">Entre com sua conta</p>
        <p className="text-sm text-gray-500 mb-6">
          Informe seu Usuário e senha para entrar
        </p>

        {erroLogin && (
          <div className="text-red-600 bg-red-100 border border-red-300 px-4 py-2 rounded text-center mb-4">
            {erroLogin}
          </div>
        )}

        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-400 text-white py-2 rounded-md mb-3"
        >
          Entrar
        </button>
        <button
          onClick={() => (window.location.href = "/cadastro")}
          className="w-full border border-gray-400 hover:bg-gray-100 text-black py-2 rounded-md"
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}
