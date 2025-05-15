import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erroLogin, setErroLogin] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });

      const {
        access,
        refresh,
        username: userFromBackend,
        is_staff,
      } = response.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("username", userFromBackend);
      localStorage.setItem("is_staff", is_staff);
      localStorage.removeItem("fotoPerfil"); // 👈 adiciona esta linha aqui!

      if (is_staff) {
        window.location.href = "/professor";
      } else {
        window.location.href = "/home";
      }
    } catch (error) {
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
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="password"
          placeholder="Senha"
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
