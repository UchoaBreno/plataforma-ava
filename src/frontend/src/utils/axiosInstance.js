// src/utils/axiosInstance.js
import axios from "axios";

// Detecta baseURL (CRA -> REACT_APP_API_URL, Vite -> VITE_API_URL, fallback local)
const fromCRA =
  typeof process !== "undefined" &&
  process.env &&
  process.env.REACT_APP_API_URL;

const fromVite =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_API_URL;

const baseURL = fromCRA || fromVite || "http://127.0.0.1:8000/api/";
console.log("[axiosInstance] baseURL =", baseURL);

// Endpoints públicos (não enviar Authorization)
const PUBLIC_ENDPOINTS = [
  "login/",
  "token/",
  "usuarios/",                 // cadastro de aluno
  "solicitacoes-professor/",   // cadastro/solicitação de professor
  "password-reset",
  "reset_password",
  "password-reset/request",
  "password-reset/confirm",
];

function isJwtExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  } catch {
    // Se não conseguir decodificar, considere inválido
    return true;
  }
}

const axiosInstance = axios.create({ baseURL });

// Anexa/remover Authorization antes de cada request
axiosInstance.interceptors.request.use(
  (config) => {
    const url = (config.url || "").toLowerCase();
    const isPublic = PUBLIC_ENDPOINTS.some((p) => url.includes(p));

    if (isPublic) {
      // NUNCA envie Authorization para endpoints públicos
      delete config.headers["Authorization"];
      return config;
    }

    const token = localStorage.getItem("access");
    if (token && !isJwtExpired(token)) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete config.headers["Authorization"];
      if (token) localStorage.removeItem("access"); // limpa token antigo
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Trata 401: limpa token e redireciona em rotas privadas
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = (err.config?.url || "").toLowerCase();
      const isPublic = PUBLIC_ENDPOINTS.some((p) => url.includes(p));
      localStorage.removeItem("access");
      if (!isPublic) {
        // Só redireciona para /login se era rota privada
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;