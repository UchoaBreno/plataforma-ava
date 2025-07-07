import axios from "axios";

// 🔷 Aqui você troca a baseURL para o domínio do Render:
const axiosInstance = axios.create({
  baseURL: "https://plataforma-ava2.onrender.com/api/",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  },
});

// 🔷 Atualiza token em caso de 401
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
