import axios from "axios";

// 🔷 Instância básica com baseURL correta
const axiosInstance = axios.create({
  baseURL: "https://plataforma-ava2.onrender.com/api/",
});

// 🔷 Sempre adiciona o token mais recente antes de cada requisição
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔷 Redireciona para login em caso de 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
