import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBookOpen,
  FaPuzzlePiece,
  FaClipboardCheck,
  FaComments,
  FaChartBar,
  FaSignOutAlt,
  FaCamera,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

export default function Sidebar({ isStaff = undefined, isAluno = undefined }) {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [menuOpen, setMenuOpen] = useState(false);

  const defaultIsStaff = useMemo(() => {
    if (isStaff === true) return true;
    if (isAluno === true) return false;
    try {
      const tok = localStorage.getItem("access");
      if (!tok) return false;
      return jwtDecode(tok).is_staff;
    } catch {
      return false;
    }
  }, [isStaff, isAluno]);

  const [staff, setStaff] = useState(defaultIsStaff);
  const [fotoPerfil, setFotoPerfil] = useState(localStorage.getItem("fotoPerfil"));

  useEffect(() => setStaff(defaultIsStaff), [defaultIsStaff]);

  const handleImagemSelecionada = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("fotoPerfil", reader.result);
      setFotoPerfil(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const alunoMenu = [
    { path: "/", match: "/", label: "Início", icon: <FaHome /> },
    { path: "/aulas", match: "/aulas", label: "Aulas", icon: <FaBookOpen /> },
    { path: "/quizzes", match: "/quizzes", label: "Quizzes", icon: <FaPuzzlePiece /> },
    { path: "/atividades", match: "/atividades", label: "Atividades", icon: <FaClipboardCheck /> },
    { path: "/forum-aluno", match: "/forum-aluno", label: "Fórum", icon: <FaComments /> },
    { path: "/desempenho-aluno", match: "/desempenho-aluno", label: "Desempenho", icon: <FaChartBar /> },
  ];

  const profMenu = [
    { path: "/professor", match: "/professor", label: "Início", icon: <FaHome /> },
    { path: "/aulas-prof", match: "/aulas-prof", label: "Aulas", icon: <FaBookOpen /> },
    { path: "/quizzes", match: "/quizzes", label: "Quizzes", icon: <FaPuzzlePiece /> },
    { path: "/atividades", match: "/atividades", label: "Atividades", icon: <FaClipboardCheck /> },
    { path: "/forum-professor", match: "/forum-professor", label: "Fórum", icon: <FaComments /> },
    { path: "/desempenho-professor", match: "/desempenho-professor", label: "Desempenho", icon: <FaChartBar /> },
  ];

  const items = staff ? profMenu : alunoMenu;

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("fotoPerfil");
    navigate("/login");
  };

  const SidebarContent = () => (
    <>
      <div className="border-b border-gray-700 p-6 text-2xl font-bold text-white flex justify-between lg:justify-center">
        <span>
          B-High<span className="text-green-500">Education</span>
        </span>
        <button
          className="text-white text-xl lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <FaTimes />
        </button>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        {items.map(({ path, match, label, icon }) => {
          const active = location.pathname.startsWith(match);
          return (
            <button
              key={path + label}
              onClick={() => {
                navigate(path);
                setMenuOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded px-4 py-2 text-left transition ${
                active
                  ? "font-semibold text-green-500 bg-gray-800"
                  : "text-white hover:bg-gray-700"
              }`}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </nav>

      <div
        className="border-t border-gray-700 p-4 flex flex-col items-center"
        onClick={() => fileInputRef.current.click()}
      >
        <div
          className="relative w-16 h-16 mb-2 cursor-pointer group"
          title="Alterar foto"
        >
          <img
            src={fotoPerfil || "https://www.gravatar.com/avatar?d=mp&s=200"}
            alt="Perfil"
            className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
          />
          <div className="absolute bottom-0 right-0 bg-green-600 group-hover:bg-green-700 p-1 rounded-full text-white text-xs">
            <FaCamera />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImagemSelecionada}
            className="hidden"
          />
        </div>
        <span className="text-sm text-white text-center">
          {staff ? "Professor" : "Aluno"}
          <br />
          <span className="text-gray-400">{localStorage.getItem("username")}</span>
        </span>
      </div>

      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded bg-red-500 py-2 text-white hover:bg-red-600"
        >
          <FaSignOutAlt /> Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 p-2 rounded text-white"
        onClick={() => setMenuOpen(true)}
      >
        <FaBars />
      </button>

      <div className="hidden lg:flex fixed top-0 left-0 flex-col h-screen w-64 bg-gray-900 dark:bg-gray-800">
        <SidebarContent />
      </div>

      {menuOpen && (
        <div className="fixed top-0 left-0 z-50 flex flex-col h-screen w-64 bg-gray-900 dark:bg-gray-800 shadow-lg lg:hidden">
          <SidebarContent />
        </div>
      )}
    </>
  );
}
